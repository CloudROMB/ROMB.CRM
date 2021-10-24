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
  OnDestroy, ElementRef
} from '@angular/core';
import {drag} from '../utils/drag';
import {SharedService} from '../../services/shared.service';
import {
  CellType,
  DataTableColumn,
  DataTableRequestParams, DataTableRow, DataTableView, defaultDataTableRequestStates,
  defaultDataTableViewStates, DTKeysFocus, DTKeysMemoryAction, DTKeyStateChangedEvent,
  DTViewTypes, LiteCellCallback, LiteRowCallback
} from '../../classes/tables';
import {
  alertsTypes,
  ContextMenuItem,
  DTMetaTypes,
  MULFile,
  MULFiles,
  SuggestionTypes
} from '../../classes/types';
import {ApiResponse} from '../../classes/responses';
import {ApiService} from '../../services/api.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {defaultContextMenu, defaultSelectModalContextMenu} from '../../classes/constants';
import {CutcellPipe} from '../../pipes/cutcell.pipe';
import {ContextMenuComponent} from '../../menus/contextmenu/contextmenu.component';
import {CardStatuses} from '../../classes/data';
import {defaultDTTranslations, defaultSystemTranslation} from '../../classes/translation';
import {ActivatedRoute, Router} from '@angular/router';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {debugLog, errorLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-datatable-lite',
  templateUrl: './tablelite.html',
  styleUrls: ['./table.scss']
})
export class DataTableLiteComponent implements OnInit, AfterViewInit, OnDestroy {
  allowSave: boolean | null = null; // see beforeSave emitter
  suggType = SuggestionTypes;
  systemTranslation = defaultSystemTranslation;
  showIDInput = false;
  private openID: string | null;

  @Input() keyState: DTKeysFocus;
  private prevKeyStates: DTKeysFocus[] = [];

  @Output() selectMenuItem = new EventEmitter();
  @Input() contextMenuItems: ContextMenuItem[];
  initedContextMenu;

  metaType: string;
  credentials = [];
  credentialsRule = false; // flag "no credentials" for an some action

  @Input() selectMode;
  @Input() item: any;
  @Input() itemStructure: any = {};
  // object to fill fields to the new item
  newItem: any = null;
  // object to check changes
  private copyItem: any;
  changed = false;
  private allRowExpanded = false;

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
    // this.triggerReload();
  };

  // Колонки таблицы
  @Input() source: string;

  // МЕТАДАТА
  metadata: any;

  columnCount = 0;
  // Колонки таблицы
  @Input() columns: DataTableColumn[];

  // Записи таблицы
  @Input() count = 0;

  rows: DataTableRow[];

  private _items: any[];
  get items() {
    return this._items;
  }

  @Input() set items(items: any[]) {
    this._items = items;
    this.onReloadFinished().then();
  }

  // Array with custom columns hidden
  @Input() customColsHide: Array<string>;

  @Input() titleTail: Array<string>;

  // EVENTS
  @Output() reload = new EventEmitter();

  // AFTER ROWS REBUILDED IF NOT EMPTY
  @Output() rowsRebuilded = new EventEmitter();

  // clicks
  @Output() headerClick = new EventEmitter();
  @Output() rowClick = new EventEmitter();
  @Output() rowDoubleClick = new EventEmitter();
  @Output() cellClick = new EventEmitter();
  @Output() cellDoubleClick = new EventEmitter();

  /**
   * @var {boolean} waitForEvent - the flag must be set for waiting in beforeXXX handlers
   */
  public waitForEvent: false;

  @Output() beforeAddNew = new EventEmitter();
  @Output() afterOpen = new EventEmitter();
  @Output() afterReloadCard = new EventEmitter();

  /**
   * @event beforeSave
   * @param {Object} doc - document card object of collection "source"
   * @param {DataTableLiteComponent} item - link into DataTable component
   */
  @Output() beforeSave = new EventEmitter(); // see allowSave property

  @Output() afterSave = new EventEmitter();
  @Output() afterClose = new EventEmitter();

  // DELETE
  @Output() beforeDelete = new EventEmitter();
  @Output() afterDelete = new EventEmitter();
  @Output() deleteAllClick = new EventEmitter();

  // header menu
  @Output() addNewClick = new EventEmitter();
  @Output() copyNewClick = new EventEmitter();
  @Output() editClick = new EventEmitter();
  @Output() viewClick = new EventEmitter();

  // select modal events
  @Output() needSelectItem = new EventEmitter();
  @Output() selectItemClick = new EventEmitter();
  @Output() cancelSelectClick = new EventEmitter();

  // UI components:
  @ViewChildren(ContextMenuComponent) menus: QueryList<ContextMenuComponent>;
  @ContentChild('dataTableCardTemplate') dataTableCard: TemplateRef<any>;
  @ContentChild('dataTableHeaderFilterTemplate') dataTableHeader: TemplateRef<any>;

  // _displayParams = <DataTableRequestParams>{}; // params of the last finished reload

  // column resizing:
  private _resizeInProgress = false;
  resizeMinLimit = 50;
  resizeMaxLimit = 400;

  // selection:
  selectedRowIndex = -1;
  selectedRow: DataTableRow;
  selectedRows: DataTableRow[] = [];
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
    // console.log('source', this.source,
    //   'keyCode', event.keyCode,
    //   'Shift', event.shiftKey,
    //   'Ctrl', event.ctrlKey,
    //   'Alt', event.altKey,
    //   'keyState', this.keyState);

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
          case 13: // Enter
            if (event.ctrlKey) {
              if (this.dtView.type === DTViewTypes.edit) {
                this.saveCard();
              } else {
                this.closeCard(true);
              }
              SharedService.stopEvent(event);
            }
            return;
          case 82: // R key
            if (event.altKey) {
              if (this.item) {
                this.updateItemInfo(this.item._id);
              }
              SharedService.stopEvent(event);
            }
            return;
          case 27: // Escape
            this.closeCard(true);
            SharedService.stopEvent(event);
            return;
        }
        break;
    }
    return;
  }

  // constructor(@Inject(forwardRef(() => SharedService)) private shared: SharedService) {
  constructor(public shared: SharedService,
              private element: ElementRef,
              private alerts: AlertsModule,
              private api: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private currencyPipe: CurrencyPipe,
              private domSanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private cutCellPipe: CutcellPipe) {
    // this.dtView = this.shared.copyObject(defaultDataTableViewStates);
    // this._dtRequest = this.shared.copyObject(defaultDataTableRequestStates);
  }

  // init
  async ngOnInit() {
    await this.api.getCredentials();

    if (!this.dtView) {
      this.dtView = this.shared.copyObject(defaultDataTableViewStates);
    }
    if (!this._dtRequest) {
      this._dtRequest = this.shared.copyObject(defaultDataTableRequestStates);
    }

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
    this.getColumns().then()
      .catch(err => {
        debugLog('getColumns()', err.message);
      });

    $.material.init();
    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();

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
    }, 1000);

    if (this.source) {
      const meta = await this.api.getMeta(this.source)
        .catch(err => {
          errorLog('TableLite getMeta():', err);
          AlertsModule.notifyDangerMessage('Не удалось получить тип метаданных');
        });
      if (meta && meta.result && meta.data && meta.data.type) {
        this.metaType = meta.data.type.id;
      }
    }
    if (!this.metaType) {
      this.metaType = DTMetaTypes.reference;
    }

    console.log('INIT:', this.source, this.metaType, this.dtView.type, this.keyState);
    // open card of :id parameter
    if (this.dtView.type === DTViewTypes.list && this.keyState === DTKeysFocus.list) {
      const route = this.router.routerState.root;
      // this.openID = route.snapshot.paramMap.get('id');
      // console.log('router', route.snapshot.paramMap);
      this.openID = this.route.snapshot.paramMap.get('id');
      // console.log('router', this.route.snapshot.paramMap);
      // console.log('router', this.source, this.openID, this.keyState, this.dtView.type);
      if (this.openID) {
        if (this.openID === 'new') {
          this.openID = null;
          setTimeout(() => {
            this.openNewCard();
          }, 250);
        } else {
          setTimeout(() => {
            this.openCardEditMode(this.openID);
          }, 300);
        }
      }
    }
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

  isColumnVisible(col): boolean {
    if (this.customColsHide && this.customColsHide.length) {
      return col.visible && this.customColsHide.indexOf(col.property) < 0;
    } else {
      return col.visible;
    }
  }

  private async getColumns(): Promise<void> {
    // if (!this.columns && this.source) {
    if (this.source) {
      const meta = await this.api.getMeta(this.source);
      debugLog('COLS:', [this.source, meta, this.dtView.autoReload, this.dtView]);
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
      console.log('NO data-table source');
      this.triggerReload();
    }

    this.columnCount = this.columnCountFn();
    console.log('Columns: ', this.columns);
  }

  async reloadItems() {
    // console.time('reload');
    debugLog('Table start reload:', this.source);
    // $('.pagination-wrapper').attr('hidden', 'hidden');
    // $('.pagination-wrapper').css('background-color', 'lightgray');
    const pag = <HTMLElement>this.element.nativeElement.querySelector('.pagination-wrapper');
    pag.style.backgroundColor = 'lightgray';

    this.reloading = true;
    // this.item = this.shared.copyObject(this.itemStructure);

    this.reload.emit(this.dtRequest);

    if (this.source) {
      console.log('params:', this.dtRequest);
      const list = await this.api.getList(this.source,
        this.shared.copyObject(this.dtRequest),
        this.shared.copyObject(this.dtRequest.criteria)
      )
        .catch(err => {
          debugLog('Error get list:', err.message);
        });
      // console.log('getToDos', resp);
      if (list) {
        debugLog('Loaded Items:', this.source, list, this.item);
        const res = <ApiResponse>list;
        if (res.result === true) {
          this.count = res.data.length;

          if (!(this.rows && this.rows.length) || !this.shared.compareObjects(this.items, res.data.list)) {
            // console.time('moveSelectionFirst+++');
            this.items = this.shared.copyObject(res.data.list);
            this.buildOutputItems(this.items);

            setTimeout(this.moveSelectionLastPos, 250, this);
          } else {
            // this.onReloadFinished();
          }
          setTimeout(this.onReloadFinished.bind(this), 250);
          debugLog('Table reloaded OK:', this.source);

          // console.log('getToDos', this.items);
          // console.timeEnd('reload');
        } else {
          this.onReloadFinished().then();
          console.log('Get Items Error:', res.message);
          AlertsModule.notifyMessage('Не удалось получить данные. Обновите страницу.');
        }
      } else {
        AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
        this.onReloadFinished().then();
      }
    } else {
      this.buildOutputItems(this.items);
      // console.timeEnd('reload');
    }
  }

  private async onReloadFinished() {
    this.reloading = false;
    this._selectAllCheckbox = false;

    const pag = <HTMLElement>this.element.nativeElement.querySelector('.pagination-wrapper');
    pag.style.backgroundColor = 'white';
  }

  // for avoiding cascading reloads if multiple params are set at once:
  triggerReload() {
    // console.trace();
    // console.log('scheduledReload:', this.scheduledReload);
    if (!this.reloading) {
      this.reloading = true;
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

  setChangeState(changed?: boolean | null) {
    try {
      if (changed === true) {
        this.changed = true;
        this.copyItem = null;
      } else if (changed === false) {
        this.changed = false;
        if (this.item) {
          this.copyItem = this.shared.copyObject(this.item);
        } else {
          this.copyItem = null;
        }
        // console.log('changed:', !this.shared.compareObjects(this.item, this.copyItem));
      } else {
        this.checkCardChanged();
      }
    } catch (err) {
      errorLog('setChangeState():', err);
    }
  }

  // event handlers:
  rowClicked(row: DataTableRow, event: MouseEvent) {
    // console.log('event.type', event.type);
    if (event.type === 'contextmenu') {
      if (!row.selected) {
        row.selected = true;
        this.updateRowsSelection(row);
        this.rowClick.emit({row: row, event: event});
      } else if (this.dtView.showExpandableRows) {
        row.expanded = !row.expanded;
      }
    } else {
      if (!row.selected) {
        row.selected = true;
        this.updateRowsSelection(row);
        this.rowClick.emit({row: row, event: event});
      } else if (this.dtView.showExpandableRows) {
        row.expanded = !row.expanded;
      }
      // row.selected = !row.selected;
    }
    // this.rowClick.emit({row, event});
  }

  rowDoubleClicked(row: DataTableRow, event: MouseEvent) {
    row.selected = true;
    this.updateRowsSelection(row);

    if (this.keyState === DTKeysFocus.modal) {
      this.selectItemModal();
    } else if (this.keyState === DTKeysFocus.list) {
      this.openCardEditMode();
    }

    this.rowDoubleClick.emit({
      row: row,
      event: event
    });
  }

  togleExpandRows() {
    if (this.rows) {
      this.allRowExpanded = !this.allRowExpanded;
      this.rows.forEach(row => {
        row.expanded = this.allRowExpanded;
      });
    }
  }

  expandedRowClicked(row: DataTableRow) {
    row.expanded = !row.expanded;
  }

  headerClicked(column: DataTableColumn, event: MouseEvent) {
    if (!this._resizeInProgress) {
      this.sortColumn(column);
      this.headerClick.emit({column, event});
    } else {
      this._resizeInProgress = false; // this is because I can't prevent click from mouseup of the drag end
    }
  }

  cellClicked(row: DataTableRow, col: DataTableColumn, event: MouseEvent) {
    if (row && row.item && col && col.property) {
      const val = row.item[col.property];
      this.cellClick.emit({
        value: val,
        culumn: col,
        event: event
      });
    }
    // value: any, column: DataTableColumn, row: DataTableRowComponent, event: MouseEvent
  }

  cellDoubleClicked(row: DataTableRow, col: DataTableColumn, event: MouseEvent) {
    if (row && row.item && col && col.property) {
      const val = row.item[col.property];
      this.cellDoubleClick.emit({
        value: val,
        row: row,
        culumn: col,
        event: event
      });
    }
    // value: any, column: DataTableColumn, row: DataTableRowComponent, event: MouseEvent
  }

  // ITEMS EVENTS
  // new item
  async openNewCard() {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }
    this.newItem = null;

    const cred = this.shared.checkCredentials([this.metaType + '_new']);
    if (!(cred instanceof Array && cred.length > 0)) {
      // there is no credentials for adding a new card
      this.credentialsRule = false;
      return;
    } else {
      this.credentialsRule = true;
    }
    // developer can change property this.newItem to fill the card
    this.beforeAddNew.emit(this);
    // component waits while handler will set the flag 'waitForEvent' to 'false'
    while (this.waitForEvent) {
      await this.shared.delay(30);
    }

    if (this.newItem) {
      this.item = this.shared.copyObject(this.newItem);
    } else {
      this.item = this.shared.copyObject(this.itemStructure);
    }
    debugLog('NEW CARD:', this.item);
    this.newItem = null;

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
            this.afterDelete.emit({
              item: doc,
              type: 'delete',
              result: true
            });

            console.log('DELETED from DB:', res.data);
            this.triggerReload();
          } else {
            this.afterDelete.emit({
              message: (res.message) ? res.message : null,
              type: 'delete',
              result: false
            });
            console.log('ERROR deleteDocument:', res);
            AlertsModule.notifyMessage('Не удалось удалить документ. Обновите страницу.');
          }
        } else {
          this.afterDelete.emit({
            message: 'bad server answer',
            type: 'delete',
            result: false
          });
          console.log('ERROR deleteDocument:', answer);
          AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
        }
      })
      .catch(err => {
        this.afterDelete.emit({
          message: err.message,
          type: 'delete',
          result: false
        });
        console.error('ERROR deleteDocument:', err.message);
        AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
      });
  }

  private unDeleteDocument(doc) {
    this.api.deleteDocument(this.source, doc._id, true)
      .then(answer => {
        if (answer) {
          const res = <ApiResponse>answer;
          if (res.result === true) {
            this.afterDelete.emit({
              item: doc,
              type: 'undelete',
              result: true
            });

            console.log('UNDELETED in DB:', res.data);
            this.triggerReload();
          } else {
            this.afterDelete.emit({
              message: (res.message) ? res.message : null,
              type: 'undelete',
              result: false
            });
            console.log('ERROR unDeleteDocument:', res);
            AlertsModule.notifyMessage('Не удалось восстановать документ. Обновите страницу.');
          }
        } else {
          console.log('ERROR unDeleteDocument:', answer);
          AlertsModule.notifyMessage('Нет соединения. Обновите страницу.');
        }
      })
      .catch(err => {
        this.afterDelete.emit({
          message: err.message,
          type: 'undelete',
          result: false
        });
        console.log('ERROR unDeleteDocument:', err.message);
        AlertsModule.notifyMessage('Не удалось восстановать документ. Обновите страницу.');
      });
  }

  async deleteClicked() {
    const selected = this.getSelectedItem();
    if (!selected) {
      console.log('Nothing to delete');
      AlertsModule.notifyDangerMessage('Чтобы удалить карточку, выберите ее в таблице.');
      return;
    }

    selected.credentials = this.shared.checkCredentials([this.metaType + '_delete']);
    console.log('DEL:', this.metaType + '_delete', selected.credentials);
    this.beforeDelete.emit(selected);
    if (!(selected.credentials instanceof Array && selected.credentials.length > 0)) {
      AlertsModule.notifyMessage('Недостаточно прав', alertsTypes.WARNING);
      return;
    }

    if (this.source && selected._id) {
      console.log('NEED to delete:', selected);
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
        this.afterDelete.emit({
          item: selected,
          type: 'delete',
          result: true
        });
      }
    }
  }

  // edit item
  async openCardEditMode(id?) {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }

    try {
      let selected: any;
      let ID = null;
      if (!id) {
        selected = this.getSelectedItem();
        if (!selected) {
          throw new Error('Чтобы редактировать карточку, выберите ее в таблице.');
        }
      } else {
        selected = {_id: id};
      }

      ID = selected._id;
      if (!ID) {
        throw new Error('Карточка не выбрана');
      }

      selected.credentials = this.shared.checkCredentials([this.metaType + '_edit']);
      this.editClick.emit(selected);
      if (!(selected.credentials instanceof Array && selected.credentials.length > 0)) {
        return;
      }

      const err = await this.updateItemInfo(ID, false);
      if (err) {
        throw err;
      }
      this.showCard(DTViewTypes.edit);
      this.initKeyStates(DTKeysFocus.card);
    } catch (e) {
      console.log('Edit Item Error:', e.message);
      AlertsModule.notifyMessage('Не удалось открыть карточку. Обновите страницу');
    }
  }

  /**
   * Reload card content by '_id'
   *
   * @async
   * @method updateItemInfo
   * @param id - '_id' property
   * @param interactive - is update procedure executed by user
   * @returns {null|Error}
   */
  async updateItemInfo(id, interactive = true) {
    try {
      let counter = 0;
      while (counter < 5 && this.reloading) {
        // console.log('waiting updateItemInfo...');
        await this.shared.delay(300);
        counter++;
      }
      if (this.reloading) {
        AlertsModule.notifyMessage('Проблемы с загрузкой карточки. Обновите страницу');
        return null;
      }

      if (!id) {
        // console.log('4.1', id);
        if (this.item && this.item._id) {
          id = this.item._id;
        } else {
          // console.log('4.2');
          AlertsModule.notifyMessage('Не выбрана карточка', alertsTypes.WARNING);
          throw new Error('Не выбрана карточка');
        }
      }

      debugLog('updateItemInfo', id);
      this.reloading = true;

      if (interactive === true && this.checkCardChanged()) {
        // console.log('3', id);
        this.pushKeyState();
        this.initKeyStates(DTKeysFocus.swal);
        const answer = await AlertsModule.discardRefreshAlert();
        // const answer = await this.shared.querySaveCard();
        this.popKeyState();
        // continue to edit card
        if (answer === true) {
          await this.saveCard(false, false);
        }
      }

      // if (this.copyItem && ID === this.copyItem._id) {
      //   this.item = this.shared.copyObject(this.copyItem);
      //   this.showCard(DTViewTypes.edit);
      //   this.initKeyStates(DTKeysFocus.card);
      // } else {

      if (this.newItem) {
        this.item = this.shared.copyObject(this.newItem);
      } else {
        this.item = this.shared.copyObject(this.itemStructure);
      }
      this.copyItem = this.shared.copyObject(this.item);
      // this.item = null;
      // this.copyItem = null;
      this.changed = false;
      // console.log('5', id);

      const res: ApiResponse = await <Promise<ApiResponse>>this.api.getDocumentById(this.source, id)
        .catch(err => {
          // console.log('6', err);
          throw err;
        });
      // }
      // console.log('DOC by ID', this.source, res);

      if (!(res.result === true && res.data)) {
        // console.log('8', res.message);
        // send message about error (false)
        this.afterReloadCard.emit(false);
        throw new Error(res.message);
      }

      this.item = this.shared.fillObject(res.data, this.itemStructure);
      // this.item = this.shared.copyObject(res.data);
      this.copyItem = this.shared.copyObject(this.item);
      this.changed = false;
      // console.log('7', this.changed);

      // send document item in the message (object)
      this.afterReloadCard.emit(this.item);
      debugLog('updateItemInfo:', this.item);
      this.reloading = false;
      return null; // it's OK, no error returns
    } catch (err) {
      this.reloading = false;
      errorLog('updateItemInfo:', err);
      return err;
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

    // console.log('Selected', this.source, sel);
    this.selectItemClick.emit(this.shared.getObjectToFieldStore(sel, this.source));
  }

  // modal SELECT item
  cancelSelect() {
    this.cancelSelectClick.emit();
  }

  // VIEW item
  async viewCardClicked() {
    // Не показывать карточку, если нет шаблона
    if (!this.dataTableCard) {
      return;
    }

    try {
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

      selected.credentials = this.shared.checkCredentials([this.metaType + '_view']);
      this.viewClick.emit(selected);
      if (!(selected.credentials instanceof Array && selected.credentials.length > 0)) {
        return;
      }

      const err = await this.updateItemInfo(ID, false);
      if (err) {
        throw err;
      }
      this.showCard(DTViewTypes.view);
      this.initKeyStates(DTKeysFocus.card);
    } catch (e) {
      console.log('View Item Error:', e.message);
      AlertsModule.notifyMessage('Не удалось открыть карточку. Обновите страницу');
    }
  }

  // CARD EVENTS
  async saveCard(interactive = true, closeCard = true) {
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

    // check "allowed to save" state
    if (!this.item) {
      console.error('Can not save card of table:', this.source, 'The item property is empty');
      return;
    }

    this.allowSave = null;
    /**
     * @param {Object} doc - document card object of collection "source"
     * @param {DataTableLiteComponent} item - link into DataTable component
     */
    this.beforeSave.emit({
      doc: this.item,
      table: this
    });

    let saveCounter = 0;
    // 30 loop times is equal 3 seconds waiting
    while ((this.allowSave === null) && (saveCounter < 30)) {
      await this.shared.delay(100);
      saveCounter++;
    }
    if (this.allowSave === false) {
      console.log('ERROR:', 'not allowed to save the card');
      return;
    }

    // очень плохое решение, оно зависит от скорости и загрузки компьютера. Нужно получать статус возврата из клиента метода beforeSave
    // await this.shared.delay(1000);
    // END check "allowed to save" state

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
      console.log('save doc', answer);

      if (closeCard) {
        await this.closeCard();
        this.triggerReload();
      }
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
      } else {
        // this.initKeyStates(DTKeysFocus.swal);
        // const answer = await AlertsModule.closeDataCard();
        // this.initKeyStates(DTKeysFocus.card);
        // // continue to edit card
        // if (answer) {
        //   return;
        // }
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
    this.triggerReload();
  }

  // ALL CONTEXT MENU ITEMS EVENTS
  menuItemSelected(event) {
    // console.log('TABLE menuItemSelected:', event);
    const selected = this.getSelectedItem();

    if (event.item && event.item.id) {
      switch (event.item.id) {
        case 'edit':
          this.openCardEditMode();
          break;
        case 'new':
          this.openNewCard();
          break;
        case 'duplicate':
          this.duplicateItem();
          break;
        case 'view':
          this.viewCardClicked();
          break;
        case 'delete':
          this.deleteClicked();
          break;
        case 'select':
          this.selectItemModal();
          break;
        case 'cancel':
          this.cancelSelect();
          break;
        case 'showDeleted':
          this.showDeleted();
          break;
        case 'copy':
          this.copyNewClicked();
          break;
        default:
      }
      this.selectMenuItem.emit({
        item: selected,
        event: event.item
      });
    }
  }

  showDeleted() {
    const cred = this.shared.checkCredentials([this.metaType + '_delete_view']);
    if (!(cred instanceof Array && cred.length > 0)) {
      AlertsModule.notifyMessage('Недостаточно прав', alertsTypes.WARNING);
      return false;
    }

    // console.log('showDeleted:', this.dtRequest);
    // if (this.dtRequest.deleted === false) {
    //   this.dtRequest.deleted = null;
    // } else {
    //   this.dtRequest.deleted = false;
    // }
    if (this.dtRequest.deleted === true) {
      this.dtRequest.deleted = null;
    } else {
      this.dtRequest.deleted = true;
    }

    this.triggerReload();
  }

  async duplicateItem(id?) {
    const cred = this.shared.checkCredentials([this.metaType + '_duplicate']);
    if (!(cred instanceof Array && cred.length > 0)) {
      AlertsModule.notifyMessage('Недостаточно прав', alertsTypes.WARNING);
      return false;
    }

    let selected: any;
    if (!id) {
      selected = this.getSelectedItem();
      if (!selected) {
        AlertsModule.notifyMessage('Чтобы дублировать карточку, выберите ее в таблице', alertsTypes.WARNING);
        return;
      }
    } else {
      selected = {
        _id: id
      };
    }

    const ID = selected._id;
    if (!ID) {
      AlertsModule.notifyDangerMessage('Карточка не может быть дублирована');
      return;
    }

    let answer;
    answer = await this.api.duplicateDocument(this.source, selected)
      .catch(err => {
        AlertsModule.notifyDangerMessage('Ошибка создания дубликата: ' + err.message);
        return;
      });
    if (!(answer.result && answer.data)) {
      AlertsModule.notifyDangerMessage('Ошибка создания дубликата: ' + answer.message);
      return;
    }

    console.log('duplacate: ', answer, ID);
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

  columnCountFn() {
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

  getRowColor(row: DataTableRow) {
    if (this.dtView.rowColors) {
      return (<LiteRowCallback>this.dtView.rowColors)(row);
    } else {
      return null;
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
    this.rows.forEach(row => row.selected = value);
  }

  // working with rows selection
  moveSelectionLastPosById(id) {
    // set last last selected position
    let found;
    this.rows.forEach(el => {
      if (el.item && el.item._id === id) {
        el.selected = true;
        this.updateRowsSelection(el);
        found = true;
      }
    });

    // or positioning to the first pos
    if (!found && this.rows.length) {
      this.rows[0].selected = true;
      this.updateRowsSelection(this.rows[0]);
    }
  }

  moveSelectionLastPos(context?) {
    const ctx = (context) ? context : this;
    if (ctx.dtView.multiSelect) {
      return;
    }

    // set last last selected position
    let found;
    if (ctx.rows.length && ctx.selectedRow && ctx.selectedRow.item && ctx.selectedRow.item._id) {
      ctx.rows.forEach(el => {
        if (el.item && el.item._id === ctx.selectedRow.item._id) {
          el.selected = true;
          ctx.updateRowsSelection(el);
          found = true;
        }
      });
    }

    // or positioning to the first pos
    if (!found && ctx.rows.length) {
      ctx.rows[0].selected = true;
      ctx.updateRowsSelection(ctx.rows[0]);
    }
    // console.timeEnd('moveSelectionFirst+++');
  }

  moveSelectionFirst(context?) {
    const ctx = (context) ? context : this;
    if (ctx.dtView.multiSelect) {
      return;
    }

    if (ctx && ctx.rows && ctx.rows.length) {
      ctx.rows[0].selected = true;
      ctx.updateRowsSelection(ctx.rows[0]);
    }
    // console.timeEnd('moveSelectionFirst+++');
  }

  moveSelectionLast() {
    if (this.dtView.multiSelect) {
      return;
    }

    // console.log('ROWS', rowsArr, arg);
    if (this.rows && this.rows.length) {
      const row = this.rows[this.rows.length - 1];
      row.selected = true;
      this.updateRowsSelection(row);
    }
  }

  moveSelectionUp() {
    if (this.dtView.multiSelect) {
      return;
    }

    if (this.selectedRowIndex <= 0) {
      this.moveSelectionFirst();
      return;
    } else {
      const row = this.rows[this.selectedRowIndex - 1];
      row.selected = true;
      this.updateRowsSelection(row);
    }
  }

  moveSelectionDown() {
    if (this.dtView.multiSelect) {
      return;
    }

    if (this.selectedRowIndex < 0) {
      this.moveSelectionFirst();
      return;
    }

    if (this.selectedRowIndex < this.rows.length - 1) {
      const row = this.rows[this.selectedRowIndex + 1];
      row.selected = true;
      this.updateRowsSelection(row);
    } else {
      this.moveSelectionLast();
    }
  }

  updateRowsSelection(row: DataTableRow) {
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

      if (!this.rows.filter(el => el.selected).length) {
        this.selectedRow = null;
        this.selectedRowIndex = -1;
      }

      if (state) {
        this.rows.forEach((el, idx) => {
          if (this.shared.compareObjects(el, row)) { // avoid endless loop
            this.selectedRow = row;
            this.selectedRowIndex = idx;
          }
        });
      }

      // disable all selection
      this.rows.filter(el => el.selected).forEach(el => {
          if (!this.shared.compareObjects(el, row)) {
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
        // console.log('move', dx);
        // console.log('move', moveEvent, dx);

        if (this._isResizeInLimit(column, columnElement, dx)) {
          // console.log('_isResizeInLimit', columnElement, dx);
          // console.log('* column.width', column.width, columnElement.offsetWidth, dx);
          // column.width = columnElement.offsetWidth + dx;

          if (typeof column.width === 'number') {
            column.width = Number(column.width) + dx;
          } else if (typeof column.width === 'string') {
            column.width = this.px2number(column.width) + dx;
          }
        } else {

        }
      }
    });
  }

  px2number(w) {
    return Number(String(w).replace('px', ''));
  }

  private _isResizeInLimit(column: DataTableColumn, columnElement: HTMLElement, dx: number) {
    /* This is needed because CSS min-width didn't work on table-layout: fixed.
     Without the limits, resizing can make the next column disappear completely,
     and even increase the table width. The current implementation suffers from the fact,
     that offsetWidth sometimes contains out-of-date values. */

    // console.log('sibl', columnElement.nextElementSibling);
    // return !(
    //   (dx < 0 && (columnElement.offsetWidth + dx <= this.resizeLimit))
    //   || !columnElement.nextElementSibling
    //   // resizing doesn't make sense for the last visible column
    //   || (dx >= 0 && ((<HTMLElement>columnElement.nextElementSibling).offsetWidth + dx) <= this.resizeLimit)
    // );

    let resultLen = -1;
    // if (dx > 0 && columnElement.nextElementSibling) {
    if (dx > 0) {
      // resultLen = (<HTMLElement>columnElement.nextElementSibling).width + dx;
      // resultLen = this.px2number((<HTMLElement>columnElement.nextElementSibling).style.width) + dx;
      if (typeof column.width === 'number') {
        resultLen = Number(column.width) + dx;
      } else if (typeof column.width === 'string') {
        resultLen = this.px2number(column.width) + dx;
      }

      if (resultLen < this.resizeMaxLimit) {
        return true;
      } else {
        // column.width = this.resizeMaxLimit;
        return false;
      }
    } else if (dx < 0) {
      // resultLen = columnElement.offsetWidth + dx;
      if (typeof column.width === 'number') {
        resultLen = column.width + dx;
      } else if (typeof column.width === 'string') {
        resultLen = this.px2number(column.width) + dx;
      }

      if (resultLen > this.resizeMinLimit) {
        return true;
      } else {
        // column.width = this.resizeMinLimit;
        return false;
      }
    }
    // console.log('* resultLen', resultLen, dx, columnElement);
    // console.log('* resultLen', resultLen, dx, this.px2number(columnElement.style.width), columnElement.offsetWidth);

    if (resultLen > this.resizeMinLimit) {
      return true;
    } else {
      // column.width = this.resizeMinLimit;
      // return false;
    }

    if (resultLen < this.resizeMaxLimit) {
      return true;
    } else {
      // column.width = this.resizeMaxLimit;
      return false;
    }
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
    this.shared.updateInputs(150);
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
      return '';
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

    if (item.parent) {
      if (item.parent.name) {
        val = item.parent.name.trim() + (val ? ' (' + val + ')' : '');
      } else if (item.parent.code) {
        val = item.parent.code + (val ? ' (' + val + ')' : '');
      } else if (item.parent.id) {
        val = item.parent.id + (val ? ' (' + val + ')' : '');
      }
    }

    if (val && col.cutSize) {
      val = this.cutCellPipe.transform(val, col.cutSize);
    }
    // return '<' + val + '>';
    return val;
  }

  getRefObjectPresentation(obj: any, viewField?: string) {
    // console.log('getRefObjectPresentation:', obj);
    if (!(obj && typeof obj === 'object')) {
      // return '<>';
      return '';
    }

    // console.log('getRefObjectPresentation:', obj, viewField);
    let val;
    if (viewField) {
      if (obj[viewField]) {
        val = obj[viewField];
      } else {
        val = '';
      }
    } else if (obj.fullName) {
      val = obj.fullName.trim();
    } else if (obj.address) {
      val = obj.address.trim();
    } else if (obj.name) {
      val = obj.name.trim();
    } else if (obj.descr) {
      val = obj.descr.trim();
    } else if (obj.code) {
      val = obj.code;
    } else if (obj.id) {
      val = obj.id;
    } else {
      val = '';
    }

    // return '<' + val + '>';
    return val;
  }

  getDaDataObjectPresentation(obj: any, viewField?: string) {
    // console.log('getRefObjectPresentation:', obj);
    if (!obj || typeof obj !== 'object') {
      // return '<>';
      return '';
    }

    let val;
    if (viewField) {
      if (obj[viewField]) {
        val = obj[viewField];
      } else {
        val = '';
      }
    } else if (obj.value) {
      val = obj.value;
    } else if (obj.selected) {
      val = obj.selected;
    } else if (obj.unrestricted) {
      val = obj.unrestricted;
    } else if (obj.name) {
      val = obj.name.trim();
    } else if (obj.fullName) {
      val = obj.fullName.trim();
    } else {
      val = '';
    }

    // return '<' + val + '>';
    return val;
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
    let title = '';
    switch (this.dtView.type) {
      case this.dtViewTypes.new:
        title = this.dtView.newCardHeader;
        break;
      case this.dtViewTypes.edit:
        title = this.dtView.editCardHeader;
        break;
      case this.dtViewTypes.view:
        title = this.dtView.viewCardHeader;
        break;
      default:
        title = '<Неизвестное действие>';
    }

    if (this.item && this.item.code) {
      title += ' #' + this.item.code;
      if (this.titleTail && this.titleTail.length > 0) {
        this.titleTail.forEach(element => {
          title += ' ' + this.item[element];
        });
      }
    }
    return title;
  }

  pushKeyState() {
    this.prevKeyStates.push(this.keyState);
  }

  popKeyState() {
    if (this.prevKeyStates && this.prevKeyStates.length > 0) {
      this.keyState = DTKeysFocus.none;
      const prev: DTKeysFocus = this.prevKeyStates.pop() || DTKeysFocus.list;
      setTimeout(() => {
        this.keyState = prev;
      }, 100);
    }
  }

  initKeyStates(state?: DTKeysFocus) {
    this.keyState = DTKeysFocus.none;

    if (!state) {
      if (this.dtView.type === DTViewTypes.list) {
        state = DTKeysFocus.list;
      } else {
        state = DTKeysFocus.card;
      }
      this.keyState = state;
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
    }, 100);
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

  public changeCardProperty(obj: any, property: string) {
    // console.log('0 changeCardProperty:', obj, property);
    if ((this.item != null) && (typeof this.item === 'object')
      && !Array.isArray(this.item)
      && (typeof obj === 'object')
      && (property) && (property.trim() !== '')) {

      const tmp = this.shared.copyObject(obj);
      // console.log('1 changeCardProperty:', tmp);
      if (tmp != null) {
        // console.log('2 changeCardProperty:', tmp);
        this.item[property] = tmp;
        this.setChangeState();
      }
    } else {
      errorLog('changeCardProperty(): there is no item or type is worng');
    }
  }

  changeFiles(doc: any, files: MULFiles[]) {
    if (doc) {
      doc.files = this.shared.copyObject(files);

      let filesCount = 0;
      if (files) {
        files.forEach(cat => {
          if (cat.list) {
            filesCount += cat.list.length;
          }
        });
        doc.hasFiles = filesCount > 0;
      }
      console.log('filesCount', filesCount);

      this.setChangeState();
      return true;
    } else {
      console.error('ERROR changeFiles: there is no item');
      return false;
    }
  }

  changeProps(property: string, obj: any) {
    if (this.item && property && obj) {
      this.item[property] = this.shared.copyObject(obj);
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

  changeKeyState(event: DTKeyStateChangedEvent) {
    if (!event) {
      return;
    }

    if (event.action) {
      if (event.action === DTKeysMemoryAction.push) {
        this.pushKeyState();

        if (event.state) {
          this.initKeyStates(event.state);
        }
      }

      if (event.action === DTKeysMemoryAction.pop) {
        this.popKeyState();
      }
    } else {
      if (event.state) {
        this.initKeyStates(event.state);
      }
    }
  }

  checkCardChangedInterval() {
    if (this.dtView.type !== DTViewTypes.list) {
      this.changed = !this.shared.compareObjects(this.item, this.copyItem);
      return this.changed;
    }
  }

  public checkCardChanged() {
    this.changed = !this.shared.compareObjects(this.item, this.copyItem);
    return this.changed;
  }

  // request criteria
  addRequestCriteria(obj: any) {
    if (!(obj && typeof obj === 'object')) {
      return;
    }

    if (!this.dtRequest) {
      this._dtRequest = this.shared.copyObject(defaultDataTableRequestStates);
    }

    const tmp = this.shared.copyObject(this.dtRequest);
    if (!tmp.criteria) {
      tmp.criteria = {};
    }

    const keys = Object.keys(obj);
    keys.forEach(key => {
      tmp.criteria[key] = obj[key];
    });
    // console.log('---', tmp);

    this.dtRequest = this.shared.copyObject(tmp);
    return this.dtRequest;
  }

  removeRequestCriteria(obj: any) {
    if (!(obj && typeof obj === 'object' && this.dtRequest.criteria)) {
      return;
    }
    const tmp = this.shared.copyObject(this.dtRequest);

    if (obj instanceof Array) {
      obj.forEach(key => {
        if (typeof key === 'string') {
          delete tmp.criteria[key];
        }
      });
    } else {
      const keys = Object.keys(obj);
      keys.forEach(key => {
        if (tmp.criteria.hasOwnProperty(key)) {
          delete tmp.criteria[key];
        }
      });
    }
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


  // ***
  // ROWS REPRESENTATION
  getCellClassObject(column: DataTableColumn) {
    const cls: string = <string>this.getCellClass(column);
    return {
      [cls]: true
    };
  }

  getCellClass(column: DataTableColumn): string {
    let style = 'data-column';
    if (!column.styleClass && column.property) {
      if (/^[a-zA-Z0-9_]+$/.test(column.property)) {
        style += ' column-' + column.property;
      } else {
        style += ' column-' + column.property.replace(/[^a-zA-Z0-9_]/g, '');
      }
    }

    // make align
    const align = column.align ? column.align : 'left';
    style += ' ' + align;

    return style;
  }

  displayIndex(row: DataTableRow) {
    if (this.dtView.showPagination) {
      return this.dtRequest.offset + row.index + 1;
    } else {
      return row.index + 1;
    }
  }

  getCellColor(row: DataTableRow, column: DataTableColumn) {
    if (column && column.cellColors) {
      return (<LiteCellCallback>column.cellColors)(row, column);
    } else {
      return null;
    }
  }


  getTooltip(row: DataTableRow) {
    if (!(row && row.item)) {
      return '';
    }
    const view = this.dtView;
    if (!view.showExpandableRows && view.rowLiteTooltip) {
      return view.rowLiteTooltip(row);
    }

    if (view.expandablePropery && row.item[view.expandablePropery]) {
      // console.log('2');
      return row.item[view.expandablePropery];
    } else if (row.item.comment) {
      // console.log('3');
      return row.item.comment;
    } else if (row.item.descr) {
      // console.log('4');
      return row.item.descr;
    } else if (row.item.name) {
      // console.log('5');
      return row.item.name;
    } else if (row.item.code) {
      // console.log('6');
      return row.item.code;
    } else {
      // console.log('7');
      return row.item._id;
    }
  }

  getColumnTooltip(row: DataTableRow, col: DataTableColumn) {
    const view = this.dtView;

    if (!row.expanded && view.rowTooltip) {
      return view.rowTooltip(row.item, row, row.index);
    }

    if (!(row.item && col)) {
      return '';
    }
    const item = row.item;

    const v = item[col.property];
    if (!v) {
      return row.title;
    } else if (v.descr) {
      return v.descr;
    } else if (v.comment) {
      return v.comment;
    } else {
      return row.title;
    }
  }

  getColumnValue(row: DataTableRow, col: DataTableColumn) {
    if (!(row && row.item && col && col.property)) {
      return '';
    }

    let val = row.item[String(col.property)];
    // console.log('---VAL', col.property, val, typeof val);
    const dateFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;
    if (dateFormat.test(val)) {
      val = new Date(val);
    }
    // console.log('---2VAL', col.property, val, typeof val);

    // форматируем независимо от шаблона
    // if (!col.templateCell) {
    //   return val;
    // }

    if (!col.type) {
      return '';
    }

    let v;
    switch (col.type) {
      case CellType.object:
        v = this.getRefObjectPresentation(val, col.viewField);
        return v;
      case CellType.reference:
        v = this.getReferencePresentation(col, val);
        return v;
      case CellType.string:
        v = val;
        if (col.cutSize && val && String(val).length > col.cutSize) {
          v = val.slice(0, col.cutSize) + '…';
        }
        return v;
      case CellType.html:
        if (!val) {
          val = '';
        }
        return this.domSanitizer.bypassSecurityTrustHtml(val);
      case CellType.boolean:
        if (val === true) {
          // col.icon = 'check';
          // v = `<fa name="check" [spin]="false"></fa>`;
          v = `<i class="material-icons">check</i>`;
          v = `<span class="fa fa-check"></span>`;
        } else if (val === false) {
          // col.icon = 'times-circle';
          // v = `<fa name="times-circle" style="color:lightgrey;" [spin]="false"></fa>`;
          col.color = 'lightgrey';
          v = `<i class="material-icons">close</i>`;
          v = `<span class="fa fa-close"></span>`;
        } else {
          // col.color = 'lightgrey';
          // v = `<i class="material-icons">close</i>`;
          // v = `<span class="fa fa-close column-sortable-icon"></span>`;
          v = ``;
        }
        // console.log('BOOLEAN:', col.property, val, v);
        return this.domSanitizer.bypassSecurityTrustHtml(v);
      // return '';
      case CellType.icon:
        const trueIcon = col.trueIcon || 'check';
        const falseIcon = col.falseIcon || 'close';
        if (val === true) {
          // col.icon = trueIcon;
          // v = `<fa name="${trueIcon}" [spin]="false"></fa>`;
          v = `<i class="material-icons">${trueIcon}</i>`;
          v = `<span class="fa fa-${trueIcon}"></span>`;

          // console.log('++++++++++++++++++++');
        } else if (val === false) {
          // col.icon = falseIcon;
          // v = `<fa name="${falseIcon}" style="color:lightgrey;" [spin]="false"></fa>`;
          col.color = 'lightgrey';
          v = `<i class="material-icons">${falseIcon}</i>`;
          v = `<span class="fa fa-${falseIcon}"></span>`;
          // console.log('------------------');
        } else {
          v = ``;
        }
        // console.log(col.property, trueIcon, falseIcon, row.item[String(col.property)], typeof val, val, v, row.item);
        return this.domSanitizer.bypassSecurityTrustHtml(v);
      // return '';
      case CellType.date:
        v = this.datePipe.transform(val, 'dd.MM.yyyy', '+03');
        return v;
      case CellType.dateTime:
        v = this.datePipe.transform(val, 'dd.MM.yyyy HH:mm', '+03');
        return v;
      case CellType.currency:
        if (val) {
          return this.currencyPipe.transform(val, '₽', 'symbol-narrow', null, 'ru');
        }
        return '';
      case CellType.number:
        if (val) {
          return Number(val);
        }

        return '';
      default:
        return this.domSanitizer.bypassSecurityTrustHtml(val);
    }
  }

  changeColumnsVisibility(inCol: DataTableColumn) {
    this.rows.forEach((row, idx) => {
      if (row.columns) {
        row.columns.forEach((col, cidx) => {
          if (inCol.property === col.property) {
            col.visible = !col.visible;
          }
        });
      }
    });
  }

  buildOutputItems(items?: any[]) {
    if (!items) {
      items = this.items || [];
    }
    this.rows = [];
    items.forEach((item, idx) => {
      const row: DataTableRow = {
        index: idx,
        item: item,
        expanded: false,
        selected: (idx === 0),
        columns: []
      };
      row.showIndex = this.displayIndex(row);
      row.title = this.getTooltip(row);
      row.rowColor = this.getRowColor(row);

      if (this.columns) {
        this.columns.forEach((inCol, cidx) => {
          const col: DataTableColumn = this.shared.copyObject(inCol);
          col.index = cidx;
          col.ngClass = this.getCellClassObject(col);
          col.class = this.getCellClass(col);
          // col.color = this.getCellColor(row, col);
          col.value = this.getColumnValue(row, col);
          col.title = this.getColumnTooltip(row, col);

          // console.log('VAL:', col.type);
          // console.log('VAL:', col.value);

          row.columns.push(col);
        });
      }

      this.rows.push(row);
    });
    debugLog('TABLE ROWS:', this.rows);

    if (this.rows.length) {
      this.rowsRebuilded.emit(this.rows);
    }

    // set focus on rows
    setTimeout(() => {
      const search = <HTMLElement>this.element.nativeElement.querySelector('.dt-search input');
      if (search) {
        search.blur();
      }

      const el = <HTMLElement>this.element.nativeElement.querySelector('.dt-row-wrapper');
      if (el) {
        // const evt = new MouseEvent('click', {
        //   view: window,
        //   bubbles: true,
        //   cancelable: true,
        //   clientX: 1,
        //   clientY: 1
        //   /* whatever properties you want to give it */
        // });
        // el.dispatchEvent(evt);

        el.click();
        // console.log('0000000', el);
      }
    }, 250);

  }

  //  comp = {
  //    component: RefSelectComponent,
  //    table: DataTableLiteComponent
  // }
  openExernalModalSelect(comp) {
    this.pushKeyState();
    this.initKeyStates(DTKeysFocus.none);
    // console.log('+++', comp);
  }

  //  comp = {
  //    component: RefSelectComponent,
  //    table: DataTableLiteComponent
  // }
  closeExernalModalSelect(comp) {
    this.popKeyState();
  }

  checkEmptyValue(val) {
    if (val) {
      return val;
    } else {
      return '';
    }
  }

  checkEmptyProperty(val) {
    if (val) {
      return val;
    } else {
      return null;
    }
  }

  getCopyItem() {
    if (this.copyItem) {
      return this.copyItem;
    }
  }
}
