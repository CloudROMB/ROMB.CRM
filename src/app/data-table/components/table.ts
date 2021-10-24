import {
  Component,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ViewChildren,
  OnInit,
  ContentChild,
  TemplateRef,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {DataTableRowComponent} from './row';
import {drag} from '../utils/drag';
import {SharedService} from '../../services/shared.service';
import {
  CellType,
  DataTableColumn,
  DataTableRequestParams, DataTableView, defaultDataTableRequestStates,
  defaultDataTableViewStates, DTKeysFocus,
  DTViewTypes, RowCallback
} from '../../classes/tables';
import {alertsTypes, ContextMenuItem, SuggestionTypes} from '../../classes/types';
import {ApiResponse} from '../../classes/responses';
import {ApiService} from '../../services/api.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {defaultContextMenu, defaultSelectModalContextMenu} from '../../classes/constants';
import {CutcellPipe} from '../../pipes/cutcell.pipe';
import {ContextMenuComponent} from '../../menus/contextmenu/contextmenu.component';
import {CardStatuses} from '../../classes/data';
import {defaultDTTranslations, defaultSystemTranslation} from '../../classes/translation';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Params, Router, RouterState} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {source} from '@angular-devkit/schematics';
import {debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-datatable',
  templateUrl: './table.html',
  styleUrls: ['./table.scss']
})
export class DataTableComponent implements OnInit, AfterViewInit, OnDestroy {
  suggType = SuggestionTypes;
  systemTranslation = defaultSystemTranslation;
  showIDInput = false;
  private openID: string | null;

  @Input() keyState: DTKeysFocus;

  @Output() selectMenuItem = new EventEmitter();
  @Input() contextMenuItems: ContextMenuItem[];
  initedContextMenu;

  @Input() selectMode;
  @Input() item: any;
  @Input() itemStructure: any = {};
  private copyItem: any;
  changed = false;

  dtViewTypes = DTViewTypes;

  // перевод кнопок на языки
  translations = defaultDTTranslations;

  // первоначальные настройки таблицы
  @Input() dtView: DataTableView;

  // Структура параметров запроса списка
  private _dtRequest: DataTableRequestParams;
  get dtRequest() {
    return this._dtRequest;
  }

  @Input() set dtRequest(val: DataTableRequestParams) {
    this._dtRequest = val;
    this.triggerReload();
  };

  // Колонки таблицы
  @Input() source: string;

  // МЕТАДАТА
  metadata: any;

  // Колонки таблицы
  @Input() columns: DataTableColumn[];

  // Записи таблицы
  @Input() count = 0;

  private _items: any[];
  get items() {
    return this._items;
  }

  @Input() set items(items: any[]) {
    console.time('set items');
    this._items = items;
    console.timeEnd('set items');
    this.onReloadFinished();
  }

  // EVENTS
  @Output() reload = new EventEmitter();

  // clicks
  @Output() headerClick = new EventEmitter();
  @Output() rowClick = new EventEmitter();
  @Output() rowDoubleClick = new EventEmitter();
  @Output() cellClick = new EventEmitter();

  @Output() afterOpen = new EventEmitter();
  @Output() beforeSave = new EventEmitter();
  @Output() afterSave = new EventEmitter();
  @Output() afterClose = new EventEmitter();

  // header menu
  @Output() addNewClick = new EventEmitter();
  @Output() copyNewClick = new EventEmitter();
  @Output() editClick = new EventEmitter();
  @Output() viewClick = new EventEmitter();
  @Output() deleteClick = new EventEmitter();
  @Output() deleteAllClick = new EventEmitter();

  // select modal events
  @Output() needSelectItem = new EventEmitter();
  @Output() selectItemClick = new EventEmitter();
  @Output() cancelSelectClick = new EventEmitter();

  // UI components:
  @ViewChildren(DataTableRowComponent) rows: QueryList<DataTableRowComponent>;
  @ViewChildren(ContextMenuComponent) menus: QueryList<ContextMenuComponent>;
  @ContentChild('dataTableCardTemplate') dataTableCard: TemplateRef<any>;
  @ContentChild('dataTableHeaderFilterTemplate') dataTableHeader: TemplateRef<any>;

  // _displayParams = <DataTableRequestParams>{}; // params of the last finished reload

  // column resizing:
  private _resizeInProgress = false;
  resizeLimit = 50;

  // selection:
  selectedRowIndex = -1;
  selectedRow: DataTableRowComponent;
  selectedRows: DataTableRowComponent[] = [];
  private _selectAllCheckbox = false;

  // Reloading:
  reloading = false;
  reloadListInterval = null;
  reloadCheckCardInterval = null;

  // UI state without input:
  // indexColumnVisible: boolean;
  // selectColumnVisible: boolean;
  // expandColumnVisible: boolean;

  // calculated property:
  get page() {
    if (this.dtRequest.limit) {
      return Math.floor(this.dtRequest.offset / this.dtRequest.limit) + 1;
    } else {
      return 1;
    }
  }

  @Input() set page(value) {
    this.dtRequest.offset = (<number>value - 1) * this.dtRequest.limit;
    // console.log('set page:', value, this.dtRequest.offset);
    this.triggerReload();
  }

  lastPage() {
    if (!this.dtRequest.limit || !this.count) {
      return 1;
    } else {
      return Math.ceil(this.count / this.dtRequest.limit);
    }
  }

  // setting multiple observable properties simultaneously
  sort(sortBy: string, asc: boolean) {
    this.dtRequest.sortBy = sortBy;
    this.dtRequest.sortAsc = asc;
    this.triggerReload();
  }

  @HostListener('document:keyup', ['$event']) onDocumentKeyUp(event) {
    // console.log('source', this.source, 'keyCode', event.keyCode, 'keyState', this.keyState);

    // exec SWAL keys
    switch (this.keyState) {
      case DTKeysFocus.swal:
        switch (event.keyCode) {
          case 13:
            // swal.clickConfirm();
            SharedService.stopEvent(event);
            return false;
          case 27:
            // стало внезапно работать, когда отключил анимацию SWAL
            // if (swal) {
            //   console.log('swal', swal);
            //   swal.clickCancel();
            // } else {
            //   console.log('SWAL already closed');
            // }
            SharedService.stopEvent(event);
            return false;
        }
        break;
      case DTKeysFocus.modal:
        switch (event.keyCode) {
          case 13:
            this.selectItemModal();
            SharedService.stopEvent(event);
            return false;
          case 27:
            this.cancelSelect();
            SharedService.stopEvent(event);
            return false;
          case 36:
            this.moveSelectionFirst();
            SharedService.stopEvent(event);
            return false;
          case 35:
            this.moveSelectionLast();
            SharedService.stopEvent(event);
            return false;
          case 38:
            this.moveSelectionUp();
            SharedService.stopEvent(event);
            return false;
          case 40:
            this.moveSelectionDown();
            SharedService.stopEvent(event);
            return false;
        }
        break;
      case DTKeysFocus.list:
        switch (event.keyCode) {
          case 13:
            if (event.ctrlKey) {
              this.openCardEditMode();
            } else {
              this.viewCardClicked();
            }
            SharedService.stopEvent(event);
            return;
          case 27:
            this.dtView.columnSelectorOpened = false;
            break;
          case 45:
            this.openNewCard();
            SharedService.stopEvent(event);
            return false;
          case 46:
            this.deleteClicked();
            SharedService.stopEvent(event);
            return false;
          case 36:
            this.moveSelectionFirst();
            SharedService.stopEvent(event);
            return false;
          case 35:
            this.moveSelectionLast();
            SharedService.stopEvent(event);
            return false;
          case 38:
            this.moveSelectionUp();
            SharedService.stopEvent(event);
            return false;
          case 40:
            this.moveSelectionDown();
            SharedService.stopEvent(event);
            return false;
        }
        break;
      case DTKeysFocus.card:
        switch (event.keyCode) {
          case 13:
            if (event.ctrlKey) {
              if (this.dtView.type === DTViewTypes.edit) {
                this.saveCard();
              } else {
                this.closeCard(true);
              }
              SharedService.stopEvent(event);
            }
            return;
          case 27:
            this.closeCard(true);
            SharedService.stopEvent(event);
            return;
        }
        break;
    }
    return true;
  }

  // constructor(@Inject(forwardRef(() => SharedService)) private shared: SharedService) {
  constructor(public shared: SharedService,
              private alerts: AlertsModule,
              private api: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private cutCellPipe: CutcellPipe) {
    this.dtView = this.shared.copyObject(defaultDataTableViewStates);
    this._dtRequest = this.shared.copyObject(defaultDataTableRequestStates);
  }

  // init
  ngOnInit() {
    const route = this.router.routerState.root;
    // this.openID = route.snapshot.paramMap.get('id');
    // console.log('router', route.snapshot.paramMap);
    this.openID = this.route.snapshot.paramMap.get('id');
    // console.log('router', this.route.snapshot.paramMap);
    if (this.openID) {
      console.log('router', this.openID);
      setTimeout(() => {
        this.openCardEditMode(this.openID);
      }, 500);
    }

    // if (!this.dtView) {
    //   this.dtView = this.shared.copyObject(defaultDataTableViewStates);
    // }
    // if (!this._dtRequest) {
    //   this._dtRequest = this.shared.copyObject(defaultDataTableRequestStates);
    // }

    if (!this.contextMenuItems) {
      if (!this.selectMode) {
        this.contextMenuItems = this.shared.copyObject(defaultContextMenu);
      } else {
        this.contextMenuItems = this.shared.copyObject(defaultSelectModalContextMenu);
      }
    }
    this.initedContextMenu = this.contextMenuItems;
    // console.log('contextMenuItems', this.source, this.contextMenuItems, this.selectMode);

    if (!this.keyState) {
      this.initKeyStates();
    }

    // console.log('table:', this.source, 'modal:', this.selectMode, 'keyState', this.keyState);
    // console.log('itemStructure', this.itemStructure);
    this.getColumns();

    $.material.init();
    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();

    // this._initDefaultValues();
    this._initDefaultClickEvents();

    // if (this.dtView.autoReload && this.scheduledReload == null) {
    //   this.reloadItems();
    // triggerReload()
    // }


    // every 15 sec check update table list
    this.reloadListInterval = setInterval(() => {
      this.triggerReloadInterval();
    }, 15000);
    // every 3 sec check changes in the card
    this.reloadCheckCardInterval = setInterval(() => {
      this.checkCardChangedInterval();
    }, 3000);
  }

  ngAfterViewInit() {
    // console.log('menu:', this.source, this.menus);
    // console.log('dataTableCard:', this.source,  this.dataTableCard);
    // if (!this.contextMenuItems) {
    //   if (!this.selectMode) {
    //     this.contextMenuItems = this.shared.copyObject(defaultContextMenu);
    //   } else {
    //     this.contextMenuItems = this.shared.copyObject(defaultSelectModalContextMenu);
    //   }
    //   this.cdr.detectChanges();
    // }
    // console.log('contextMenuItems 2', this.source, this.contextMenuItems, this.selectMode);
  }

  ngOnDestroy() {
    clearInterval(this.reloadListInterval);
    clearInterval(this.reloadCheckCardInterval);
  }

  private async getColumns() {
    if (!this.columns && this.source) {
      const meta = await this.api.getMeta(this.source);
      debugLog('COLS:', this.source, meta);

      const res = <ApiResponse>meta;
      if (res.result === true) {
        this.dtView.headerTitle = res.data.name;

        this.metadata = res.data;
        this.columns = res.data.props;

        if (this.dtView.autoReload) {
          this.triggerReload();
          // this.reloadItems();
        }
      } else {
        console.log('Get Columns Error:', res.message);
        AlertsModule.notifyMessage('Не удалось получить данные. Обновите страницу.');
      }
    } else if (this.dtView.autoReload) {
      this.triggerReload();
    }
  }

  // private _initDefaultValues() {
  //   this.indexColumnVisible = this.dtView.showIndexColumn;
  //   this.selectColumnVisible = this.dtView.showSelectColumn;
  //   this.expandColumnVisible = this.dtView.showExpandableRows;
  // }

  private _initDefaultClickEvents() {
    this.headerClick
      .subscribe(tableEvent => {
        this.sortColumn(tableEvent.column);
      });
  }

  async reloadItems() {
    console.time('reload');
    // console.log('Table start reload:', this.source);
    // $('.pagination-wrapper').attr('hidden', 'hidden');
    $('.pagination-wrapper').css('background-color', 'lightgray');

    console.time('reload2');
    this.reloading = true;
    this.reload.emit(this.shared.fillObject(this.dtRequest));
    console.timeEnd('reload2');

    if (this.source) {
      console.time('reload3');
      console.log('params:', this.shared.fillObject(this.dtRequest));
      const list = await this.api.getList(this.source, this.shared.fillObject(this.dtRequest));
      console.timeEnd('reload3');

      // console.log('getToDos', resp);
      if (list) {
        console.time('reload4');
        console.log('ITEMS:', this.source, list);
        const res = <ApiResponse>list;
        if (res.result === true) {
          console.timeEnd('reload4');
          console.time('reload5');
          this.count = res.data.length;

          console.time('reload---');
          if (!this.shared.compareObjects(this.items, res.data.list)) {
            this.items = res.data.list;

            console.time('moveSelectionFirst+++');
            setTimeout(this.moveSelectionFirst, 300, this);
          } else {
            this.onReloadFinished();
          }
          console.timeEnd('reload---');

          console.timeEnd('reload5');

          // console.log('getToDos', this.items);
          console.timeEnd('reload');
        } else {
          console.log('Get Items Error:', res.message);
          AlertsModule.notifyMessage('Не удалось получить данные. Обновите страницу.');
          this.onReloadFinished();
        }
      } else {
        AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
        this.onReloadFinished();
      }

      // this.api.getList(this.source, this.shared.fillObject(this.dtRequest))
      //   .then(resp => {
      //     console.timeEnd('reload3');
      //     console.time('reload4');
      //     // console.log('getToDos', resp);
      //     if (resp) {
      //       console.log('ITEMS:', this.source, resp);
      //       const res = <ApiResponse>resp;
      //       if (res.result === true) {
      //         console.timeEnd('reload4');
      //         console.time('reload5');
      //         this.count = res.count;
      //         this.items = res.data;
      //         console.timeEnd('reload5');
      //
      //         setTimeout(this.moveSelectionFirst, 300, this);
      //         // console.log('getToDos', this.items);
      //         console.timeEnd('reload');
      //       } else {
      //         console.log('Get Items Error:', res.message);
      //         AlertsModule.notifyMessage('Не удалось получить данные. Обновите страницу.');
      //         this.onReloadFinished();
      //       }
      //     } else {
      //       AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
      //       this.onReloadFinished();
      //     }
      //   });
    } else {
      console.timeEnd('reload');
    }
  }

  private onReloadFinished() {
    console.time('onReloadFinished');

    this._selectAllCheckbox = false;
    this.reloading = false;
    console.timeEnd('onReloadFinished');

    console.time('onReloadFinished2');
    // $('.pagination-wrapper').removeAttr('hidden');
    $('.pagination-wrapper').css('background-color', 'white');
    console.timeEnd('onReloadFinished2');
  }

  // for avoiding cascading reloads if multiple params are set at once:
  triggerReload() {
    // console.log('scheduledReload:', this.scheduledReload);
    if (!this.reloading) {
      this.reloading = true;
      this.item = this.shared.copyObject(this.itemStructure);
      setTimeout(() => {
        this.reloadItems();
      }, 300);
    }
  }

  // auto reload table
  triggerReloadInterval() {
    if (this.dtView.type === DTViewTypes.list && this.dtView.autoReload && this.keyState === DTKeysFocus.list) {
      this.triggerReload();
    }
  }

  setChangeState(changed?) {
    if (changed === true) {
      this.changed = true;
      this.copyItem = null;
    } else if (changed === false) {
      this.changed = false;
      this.copyItem = this.shared.copyObject(this.item);
      // console.log('changed:', !this.shared.compareObjects(this.item, this.copyItem));
    } else {
      this.checkCardChanged();
    }
  }

  // event handlers:
  rowClicked(event) {
    const row: DataTableRowComponent = event.row;

    // console.log('event.type', event.type);
    if (event.event.type === 'contextmenu') {
      if (!row.selected) {
        row.selected = true;
        this.rowClick.emit(event);
      }
    } else {
      if (!row.selected) {
        row.selected = true;
        this.rowClick.emit(event);
      }
      // row.selected = !row.selected;
    }
    // this.rowClick.emit({row, event});
  }

  rowDoubleClicked(event) {
    const row: DataTableRowComponent = event.row;
    row.selected = true;

    if (this.keyState === DTKeysFocus.modal) {
      this.selectItemModal();
    } else if (this.keyState === DTKeysFocus.list) {
      this.openCardEditMode();
    }
    this.rowDoubleClick.emit(event);
  }

  headerClicked(column: DataTableColumn, event: MouseEvent) {
    if (!this._resizeInProgress) {
      this.headerClick.emit({column, event});
    } else {
      this._resizeInProgress = false; // this is because I can't prevent click from mouseup of the drag end
    }
  }

  cellClicked(event) {
    // value: any, column: DataTableColumn, row: DataTableRowComponent, event: MouseEvent
    this.cellClick.emit(event);
  }

  // ITEMS EVENTS
  // new item
  async openNewCard() {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }

    console.log('NEW ITEM', this.itemStructure);
    this.item = this.shared.copyObject(this.itemStructure);
    this.copyItem = this.shared.copyObject(this.item);
    this.changed = false;

    this.showCard(DTViewTypes.new);

    this.initKeyStates(DTKeysFocus.card);

    this.addNewClick.emit(this.item);
  }

  // copy item
  copyNewClicked() {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }

    if (this.selectedRow) {
      this.initKeyStates(DTKeysFocus.card);
      this.copyNewClick.emit(this.selectedRow);
    }
  }

  // delete item
  private deleteDocument(doc) {
    this.api.deleteDocument(this.source, doc._id)
      .then(answer => {
        if (answer) {
          const res = <ApiResponse>answer;
          if (res.result === true) {
            this.deleteClick.emit(doc);

            console.log('DELETED from DB:', res.data);
            this.triggerReload();
          } else {
            console.log('ERROR deleteDocument:', res);
            AlertsModule.notifyMessage('Не удалось удалить документ. Обновите страницу.');
          }
        } else {
          console.log('ERROR deleteDocument:', answer);
          AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
        }
      });
  }

  private unDeleteDocument(doc) {
    this.api.deleteDocument(this.source, doc._id, true)
      .then(answer => {
        if (answer) {
          const res = <ApiResponse>answer;
          if (res.result === true) {
            this.deleteClick.emit(doc);

            console.log('UNDELETED in DB:', res.data);
            this.triggerReload();
          } else {
            console.log('ERROR unDeleteDocument:', res);
            AlertsModule.notifyMessage('Не удалось восстановать документ. Обновите страницу.');
          }
        } else {
          console.log('ERROR unDeleteDocument:', answer);
          AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
        }
      });
  }

  async deleteClicked() {
    const selected = this.getSelectedItem();
    if (!selected) {
      console.log('Nothing to delete');
      AlertsModule.notifyDangerMessage('Чтобы удалить карточку, выберите ее в таблице.');
      return;
    }

    if (this.source && selected._id) {
      if (selected.deleted === true) {
        this.unDeleteDocument(selected);
      } else {
        this.initKeyStates(DTKeysFocus.swal);
        const answer = await this.shared.queryDeleteCard();
        this.initKeyStates(DTKeysFocus.list);
        // console.log('DELETE?:', answer);
        if (answer === true) {
          this.deleteDocument(selected);
        }
      }
    } else {
      const len = this.items.length;
      this.items = this.items.filter(el => {
        return (JSON.stringify(el) !== JSON.stringify(selected));
      });
      if (len !== this.items.length) {
        console.log('DELETED from list:', selected);
        this.deleteClick.emit(this.selectedRow);
      }
    }
  }

  // edit item
  async openCardEditMode(id?) {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }

    let selected: any;
    if (!id) {
      selected = this.getSelectedItem();
      if (!selected) {
        AlertsModule.notifyDangerMessage('Чтобы редактировать карточку, выберите ее в таблице.');
        return;
      }
    } else {
      selected = {
        _id: id
      };
    }

    const ID = selected._id;
    if (!ID) {
      AlertsModule.notifyDangerMessage('Карточка не может быть отредактирована');
      return;
    }
    // console.log('EDIT', ID);
    this.editClick.emit(selected);

    if (this.copyItem && ID === this.copyItem._id) {
      this.item = this.shared.copyObject(this.copyItem);
      this.showCard(DTViewTypes.edit);
      this.initKeyStates(DTKeysFocus.card);
    } else {
      const res = await this.api.getDocumentById(this.source, ID);
      console.log('DOC by ID', this.source, res);
      if (res && res.result === true) {
        this.item = this.shared.fillObject(res.data, this.itemStructure);
        this.copyItem = this.shared.copyObject(this.item);
        this.changed = false;
        console.log('---', this.item);

        this.showCard(DTViewTypes.edit);
        this.initKeyStates(DTKeysFocus.card);
      } else {
        console.log('Get Item Error:', res.message);
        AlertsModule.notifyMessage('Не удалось открыть карточку. Обновите страницу.');
      }
    }
  }

  // modal SELECT item
  public needSelectItemClicked(src) {
    this.needSelectItem.emit(src);
  }

  selectItemModal() {
    const sel = this.getSelectedItem();
    if (!sel) {
      AlertsModule.notifyDangerMessage('Выберите элемент в списке');
      return;
    }

    console.log('Selected', this.item, this.source);
    this.selectItemClick.emit(this.shared.getObjectToFieldStore(sel, this.source));
  }

  // modal SELECT item
  cancelSelect() {
    this.cancelSelectClick.emit();
  }

  // VIEW item
  viewCardClicked() {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }

    // console.log('view', this.getSelectedItem());
    const selected = this.getSelectedItem();
    if (!selected) {
      AlertsModule.notifyDangerMessage('Выберите элемент в списке');
      return;
    }

    const ID = selected._id;
    if (!ID) {
      AlertsModule.notifyDangerMessage('Карточка не может быть просмотрена');
      return;
    }
    // console.log('EDIT', ID);
    this.viewClick.emit(this.item);

    if (this.copyItem && ID === this.copyItem._id) {
      this.item = this.shared.copyObject(this.copyItem);
      this.showCard(DTViewTypes.view);
    } else {
      this.api.getDocumentById(this.source, ID)
        .then(resp => {
          if (resp) {
            console.log('+', this.source, resp);
            const res = <ApiResponse>resp;
            if (res.result === true) {
              this.item = this.shared.fillObject(res.data, this.itemStructure);
              this.copyItem = this.shared.copyObject(this.item);
              this.changed = false;

              this.showCard(DTViewTypes.view);
              this.initKeyStates(DTKeysFocus.card);
            } else {
              console.log('Get Item Error:', res.message);
              AlertsModule.notifyMessage('Не удалось открыть карточку. Обновите страницу.');
            }
          } else {
            AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
            this.onReloadFinished();
          }
        });
    }
  }

  // CARD EVENTS

  /**
   * SAVE TABLE CARD
   *
   * @async
   * @method saveCard
   * @param {boolean} [interactive=true]
   */
  async saveCard(interactive = true) {
    if (interactive) {
      if (!this.checkCardChanged()) {
        this.closeCard();
        return;
      }
      this.initKeyStates(DTKeysFocus.swal);
      const choice = await AlertsModule.saveAlert();
      this.initKeyStates(DTKeysFocus.card);
      // console.log('DELETE?:', answer);
      if (choice !== true) {
        return;
      }
    }

    this.beforeSave.emit(this.item);
    // console.log('ITEM:', this.item);

    debugLog('SAVE CARD:', this.item._id, this.item, String(this.item._id).trim());
    let answer;
    if (this.item.hasOwnProperty('_id') && this.item._id && String(this.item._id).trim()) {
      answer = await this.api.putDocument(this.source, this.item);
    } else {
      answer = await this.api.addDocument(this.source, this.item);
    }
    if (answer && answer.result) {
      this.copyItem = this.shared.copyObject(this.item);
      this.changed = false;

      this.afterSave.emit(this.item);
      // console.log('answer', answer);
      this.closeCard();
      this.triggerReload();
    } else {
      const message = answer.message || 'Не удалось сохранить документ. Повторите попытку';
      AlertsModule.notifyDangerMessage(message);
    }
  }

  async closeCard(interactive?: boolean) {
    if (interactive && this.dtView.type !== DTViewTypes.view) {
      if (this.checkCardChanged()) {
        this.initKeyStates(DTKeysFocus.swal);
        const answer = await AlertsModule.discardSaveAlert();
        // const answer = await this.shared.querySaveCard();
        this.initKeyStates(DTKeysFocus.card);
        // continue to edit card
        if (answer === true) {
          this.saveCard(false);
          return;
        }
      }
    }

    this.openID = null;
    // console.log('---', this.route);
    this.shared.removeParamToCurrentRoute(this.route);
    // console.log('---', this.route);

    // $('#cardModal').modal('hide');
    this.dtView.type = DTViewTypes.list;
    this.initKeyStates(DTKeysFocus.list);
    this.afterClose.emit();
    this.item = this.shared.copyObject(this.itemStructure);
  }

  // ALL CONTEXT MENU ITEMS EVENTS
  menuItemSelected(event) {
    // console.log('TABLE menuItemSelected:', event);
    const id = event.item.id;
    if (id === 'edit') {
      this.openCardEditMode();
    } else if (id === 'new') {
      this.openNewCard();
    } else if (id === 'view') {
      this.viewCardClicked();
    } else if (id === 'delete') {
      this.deleteClicked();
    } else if (id === 'select') {
      this.selectItemModal();
    } else if (id === 'cancel') {
      this.cancelSelect();
    } else if (id === 'showDeleted') {
      this.showDeleted();
    } else if (id === 'copy') {
      this.copyNewClicked();
    } else {
      this.selectMenuItem.emit({
        item: this.item,
        event: event.item
      });
    }
  }

  showDeleted() {
    // console.log('showDeleted:', this.dtRequest);
    if (this.dtRequest.deleted === false) {
      this.dtRequest.deleted = null;
    } else {
      this.dtRequest.deleted = false;
    }
    this.triggerReload();
  }

  // FUNCTIONS
  private sortColumn(column: DataTableColumn) {
    if (column.sortable) {
      // если первый раз сортируем колонку, то сначала по убыванию
      const ascending = (this.dtRequest.sortBy === column.property) ? !this.dtRequest.sortAsc : false;
      this.sort(column.property, ascending);
    }
  }

  get columnCount() {
    // console.time('answer time');
    let count = 0;
    if (this.columns) {
      count += this.dtView.showIndexColumn ? 1 : 0;
      count += this.dtView.showSelectColumn ? 1 : 0;
      count += this.dtView.showExpandableRows ? 1 : 0;
      this.columns.forEach(column => {
        count += column.visible ? 1 : 0;
      });
    }
    // console.timeEnd('answer time');
    return count;
  }

  getRowColor(item: any, index: number, row: DataTableRowComponent) {
    if (this.dtView.rowColors) {
      return (<RowCallback>this.dtView.rowColors)(item, row, index);
    }
  }

  // selection:
  get selectAllCheckbox() {
    return this._selectAllCheckbox;
  }

  set selectAllCheckbox(value) {
    this._selectAllCheckbox = value;
    this._onSelectAllChanged(value);
  }

  private _onSelectAllChanged(value: boolean) {
    this.rows.toArray().forEach(row => row.selected = value);
  }

  // working with rows selection
  moveSelectionFirst(context?) {
    let rowsArr;

    // after reload
    if (context && context.rows) {
      console.time('moveSelectionFirst2');
      rowsArr = context.rows.toArray();

      let found;
      if (rowsArr.length && context.copyItem && context.copyItem._id) {
        rowsArr.forEach(el => {
          if (el.item && el.item._id === context.copyItem._id) {
            el.selected = true;
            found = true;
          }
        });
      }
      if (!found && rowsArr.length) {
        rowsArr[0].selected = true;
      }
      console.timeEnd('moveSelectionFirst2');
    } else {
      console.time('moveSelectionFirst');
      rowsArr = this.rows.toArray();
      if (rowsArr.length) {
        rowsArr[0].selected = true;
      }
      console.timeEnd('moveSelectionFirst');
    }
    // console.log('ROWS', rowsArr, arg);
    console.timeEnd('moveSelectionFirst+++');
  }

  moveSelectionLast(rows?) {
    let rowsArr;
    if (rows) {
      rowsArr = rows.toArray();
    } else {
      rowsArr = this.rows.toArray();
    }
    // console.log('ROWS', rowsArr, arg);
    if (rowsArr.length) {
      rowsArr[rowsArr.length - 1].selected = true;
    }
  }

  moveSelectionUp() {
    if (this.selectedRowIndex < 0) {
      this.moveSelectionFirst();
      return;
    }

    const rowsArr = this.rows.toArray();
    if (this.selectedRowIndex > 0) {
      rowsArr[this.selectedRowIndex - 1].selected = true;
    }
  }

  moveSelectionDown() {
    if (this.selectedRowIndex < 0) {
      this.moveSelectionFirst();
      return;
    }

    const rowsArr = this.rows.toArray();
    if (this.selectedRowIndex < rowsArr.length - 1) {
      rowsArr[this.selectedRowIndex + 1].selected = true;
    }
  }

  onRowSelectChanged(row: DataTableRowComponent) {
    const state = row.selected;
    // maintain the selectedRow(s) view
    if (this.dtView.multiSelect) {
      const index = this.selectedRows.indexOf(row);
      if (row.selected && index < 0) {
        this.selectedRows.push(row);
      } else if (!row.selected && index >= 0) {
        this.selectedRows.splice(index, 1);
      }
    } else {
      // TODO: какой-то бордак, надо оптимизировать этот блок
      // this.selectedRow = row;

      const rowsArr = this.rows.toArray();

      if (!rowsArr.filter(el => el.selected).length) {
        this.selectedRow = null;
        this.selectedRowIndex = -1;
      }

      if (state) {
        rowsArr.forEach((el, idx) => {
          if (el === row) { // avoid endless loop
            this.selectedRow = row;
            this.selectedRowIndex = idx;
          }
        });
      }

      // disable all selection
      rowsArr.filter(el => el.selected)
        .forEach(el => {
            if (el !== row && row.selected) {
              // console.log(el.item.code + ' - ' + row.item.code, state);
              el.selected = false;
            }
          }
        );
    }
  }

  // other:
  get substituteItems() {
    if (!this.items || !this.dtRequest) {
      return Array.from({length: 0});
    } else {
      return Array.from({length: this.dtRequest.limit - this.items.length});
    }
  }

  // column resizing:
  resizeColumnStart(event: MouseEvent, column: DataTableColumn, columnElement: HTMLElement) {
    this._resizeInProgress = true;
    // console.log('resizeColumnStart', event, column, columnElement);

    drag(event, {
      move: (moveEvent: MouseEvent, dx: number) => {
        console.log('move', dx);
        // console.log('move', moveEvent, dx);
        if (this._isResizeInLimit(columnElement, dx)) {
          // console.log('_isResizeInLimit', columnElement, dx);
          console.log('_isResizeInLimit', dx);
          console.log('column.width', column.width);
          column.width = columnElement.offsetWidth + dx;
        }
      }
    });
  }

  private _isResizeInLimit(columnElement: HTMLElement, dx: number) {
    /* This is needed because CSS min-width didn't work on table-layout: fixed.
     Without the limits, resizing can make the next column disappear completely,
     and even increase the table width. The current implementation suffers from the fact,
     that offsetWidth sometimes contains out-of-date values. */

    // console.log('sibl', columnElement.nextElementSibling);
    return !(
      (dx < 0 && (columnElement.offsetWidth + dx <= this.resizeLimit))
      || !columnElement.nextElementSibling
      // resizing doesn't make sense for the last visible column
      || (dx >= 0 && ((<HTMLElement>columnElement.nextElementSibling).offsetWidth + dx) <= this.resizeLimit)
    );
  }

  private getSelectedItem() {
    if (this.selectedRow && this.selectedRow.item && typeof this.selectedRow.item === 'object') {
      return this.shared.copyObject(this.selectedRow.item);
    } else {
      return this.shared.copyObject(this.itemStructure);
    }
  }

  showCard(type) {
    this.dtView.type = type;

    if (this.item && this.item._id) {
      this.shared.addParamToCurrentRoute(this.route, this.item._id);
    }

    // $('#cardModal').modal({
    //   backdrop: 'static',
    //   keyboard: false
    // });

    this.initKeyStates(DTKeysFocus.card);

    const _references = $('.dt-card-form .select-reference');
    const _selects = $('.dt-card-form mat-select');
    const _inputs = $('.dt-card-form input');
    const _textarea = $('.dt-card-form textarea');

    if (type === DTViewTypes.view) {
      setTimeout(() => {
        // _inputs.attr('readonly', true);
        // _textarea.attr('readonly', true);
        _references.attr('disabled', true);
        _selects.attr('disabled', true);
      }, 50);
    } else {
      // _inputs.attr('readonly', false);
      // _textarea.attr('readonly', false);
      _references.attr('disabled', false);
      _selects.attr('disabled', false);
    }

    setTimeout(() => {
      _inputs.change();
      _textarea.change();
      _selects.change();

      // console.log($('.dt-card-form input'));
      _inputs.eq(0).focus();
    }, 250);

    this.afterOpen.emit(this.item);
  }

  // VIEW REPRESENTATIONS
  getReferencePresentation(col, item) {
    // console.log('---');
    if (!(col && col.type && col.type === CellType.reference)) {
      return '';
    }
    // console.log('---', col, item);

    if (!item || typeof item !== 'object') {
      return '<>';
    }

    let val;
    if (item.name) {
      val = item.name.trim();
    } else if (item.code) {
      val = item.code;
    } else if (item.id) {
      val = item.id;
    } else {
      val = '';
    }

    if (val && col.cutSize) {
      val = this.cutCellPipe.transform(val, col.cutSize);
    }
    // return '<' + val + '>';
    return val;
  }

  getRefObjectPresentation(obj) {
    // console.log('getRefObjectPresentation:', obj);
    if (!obj || typeof obj !== 'object') {
      // return '<>';
      return '';
    }

    let val;
    if (obj.name) {
      val = obj.name.trim();
    } else if (obj.code) {
      val = obj.code;
    } else if (obj.id) {
      val = obj.id;
    } else {
      val = '';
    }

    return '<' + val + '>';
  }

  getActiveTitle() {
    if (this.item) {
      if (this.item.active) {
        return CardStatuses.active;
      } else {
        return CardStatuses.blocked;
      }
    } else {
      return '';
    }
  }

  getCardHeaderIcon() {
    switch (this.dtView.type) {
      case this.dtViewTypes.new:
        return 'file';
      case this.dtViewTypes.edit:
        return 'file-text';
      case this.dtViewTypes.view:
        return 'eye';
      default:
        return 'file';
    }
  }

  getCardHeaderColor() {
    switch (this.dtView.type) {
      case this.dtViewTypes.new:
        return 'blue';
      case this.dtViewTypes.edit:
        return 'red';
      case this.dtViewTypes.view:
        return 'rose';
      default:
        return 'rose';
    }
  }

  getCardHeaderTitle() {
    switch (this.dtView.type) {
      case this.dtViewTypes.new:
        return this.dtView.newCardHeader;
      case this.dtViewTypes.edit:
        return this.dtView.editCardHeader;
      case this.dtViewTypes.view:
        return this.dtView.viewCardHeader;
      default:
        return '<Неизвестное действие>';
    }
  }

  initKeyStates(state?: DTKeysFocus) {
    if (!state) {
      if (this.dtView.type === DTViewTypes.list) {
        state = DTKeysFocus.list;
      } else {
        state = DTKeysFocus.card;
      }
    }

    if (this.menus) {
      const arr = this.menus.toArray();
      arr.forEach(el => {
        el.menuEnabled = (state === DTKeysFocus.list || state === DTKeysFocus.modal);

        el.items = this.initedContextMenu;
        // if (state === DTKeysFocus.list) {
        //   el.items = defaultContextMenu;
        // } else if (state === DTKeysFocus.modal) {
        //   el.items = defaultSelectModalContextMenu;
        // }

        // if (el.source === this.source) {
        //   el.menuEnabled = (state === DTKeysFocus.list || state === DTKeysFocus.modal);
        //   console.log('menuEnabled:', el.source, state, el.menuEnabled);
        // }
        // console.log('menuEnabled:', el.source, state, el.menuEnabled, el.items);
      });
    }

    setTimeout(() => {
      this.keyState = state;
    }, 300);
  }

  getCardLink(id) {
    // console.log('document.domain', document.domain);
    // console.log('document.domain', this.shared.getCurrentRoute(id));
    return this.shared.getCurrentRoute(id);
  }

  copyCardLink(e) {
    if (this.shared.copyElementValue(e.target)) {
      AlertsModule.notifyMessage(defaultSystemTranslation.copiedLinkToClipboard, alertsTypes.SUCCESS, 1000);
    }
    this.showIDInput = false;
  }

  changeCardProperty(obj: any, property: string) {
    if (this.item && typeof this.item === 'object' && !(this.item instanceof Array)
      && obj && typeof obj === 'object'
      && property && property.trim()) {
      const tmp = this.shared.copyObject(obj);
      if (tmp) {
        this.item[property] = this.shared.copyObject(obj);
        this.setChangeState();
      }
    } else {
      console.log('ERROR changeProps: there is no item or type is worng');
    }
  }

  changeFiles(files) {
    if (this.item) {
      this.item.files = this.shared.copyObject(files);

      if (files && files instanceof Array) {
        this.item.hasFiles = files.length > 0;
      }

      this.setChangeState();
    } else {
      console.log('ERROR changeFiles: there is no item');
    }
  }

  changeProps(props) {
    if (this.item) {
      this.item.props = this.shared.copyObject(props);
      this.setChangeState();
    } else {
      console.log('ERROR changeProps: there is no item');
    }
  }

  changeBanks(banks) {
    if (this.item) {
      this.item.banks = this.shared.copyObject(banks);
      this.setChangeState();
    } else {
      console.log('ERROR changeBanks: there is no item');
    }
  }

  showPreview() {
    this.initKeyStates(DTKeysFocus.preview);
  }

  closePreview() {
    this.initKeyStates(DTKeysFocus.card);
  }

  checkCardChangedInterval() {
    if (this.dtView.type !== DTViewTypes.list) {
      this.changed = !this.shared.compareObjects(this.item, this.copyItem);
      return this.changed;
    }
  }

  checkCardChanged() {
    this.changed = !this.shared.compareObjects(this.item, this.copyItem);
    return this.changed;
  }

  // request criteria
  addRequestCriteria(obj: any) {
    if (!(obj && typeof obj === 'object')) {
      return;
    }

    const tmp = this.shared.copyObject(this.dtRequest);

    if (!tmp.criteria) {
      tmp.criteria = {};
    }

    const keys = Object.keys(obj);
    keys.forEach(key => {
      tmp.criteria[key] = obj[key];
    });

    console.log('---', tmp);

    this.dtRequest = this.shared.copyObject(tmp);
    return this.dtRequest;
  }

  removeRequestCriteria(obj: any) {
    if (!(obj && typeof obj === 'object' && this.dtRequest.criteria)) {
      return;
    }
    const tmp = this.shared.copyObject(this.dtRequest);
    const keys = Object.keys(obj);
    keys.forEach(key => {
      if (tmp.criteria.hasOwnProperty(key)) {

        delete tmp.criteria[key];
      }
    });
    console.log('---', tmp);

    this.dtRequest = this.shared.copyObject(tmp);
    return this.dtRequest;
  }

  compareMatSelectWithId(obj1, obj2): boolean {
    return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
  }

  compareMatSelectWithCode(obj1, obj2): boolean {
    return obj1 && obj2 ? obj1.code === obj2.code : obj1 === obj2;
  }

}
