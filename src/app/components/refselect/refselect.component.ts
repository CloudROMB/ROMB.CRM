import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {
  DataTableRequestParams,
  DataTableView, defaultDataTableRequestStates, defaultDataTableViewStates,
  DTKeysFocus
} from '../../classes/tables';
import {SharedService} from '../../services/shared.service';
import {defaultContextMenu} from '../../classes/constants';
import {debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-ref-select',
  templateUrl: './refselect.component.html',
  styleUrls: ['./refselect.component.scss']
})
export class RefSelectComponent implements OnInit, AfterViewInit {
  @ViewChild('listModal') tableContainer: ElementRef;
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  @Input() source: string;
  @Input() rcDisabled = false;
  @Input() rcTitle = 'Выберите элемент справочника';

  // parent reference propery and value
  // {id: xxx, source: yyy} string values

  private _listCriteria: any;
  @Input() set listCriteria(val) {
    this._listCriteria = this.shared.copyObject(val);
    this.setListCriteria();
  }

  get listCriteria() {
    return this._listCriteria;
  }

  // this value must be initialized before, example = {}
  @Input() rcValue: any;
  @Input() formElementName: string;
  @Input() label: String = 'Выберите значение'; // romb components input value
  @Input() autoReload = false; // enable autoreload for DataTable
  @Input() dtView: DataTableView;
  @Input() dtReqParams: DataTableRequestParams;
  @Input() customColsHide: Array<string>;
  dtKeysFocus = DTKeysFocus;
  contextMenuModal = defaultContextMenu;
  visibleModal = false;

  @Output() valueCleared = new EventEmitter();
  @Output() openModalSelect = new EventEmitter();
  @Output() selected = new EventEmitter();
  @Output() closeModalSelect = new EventEmitter();

  constructor(private element: ElementRef,
              private shared: SharedService) {
    // параметры табличного документа
    this.dtView = shared.copyObject(defaultDataTableViewStates);
    this.dtView.showExpandableRows = false;
    this.dtView.showSelectColumn = false;
    this.dtView.showIndexColumn = false;
    this.dtView.showSubstituteRows = false;
    this.dtView.autoReload = this.autoReload;

    this.dtReqParams = shared.copyObject(defaultDataTableRequestStates);
    this.dtReqParams.limit = 20;
  }

  ngOnInit() {
    if (!this.source) {
      console.log('ERROR ref-select source:', this.element.nativeElement);
    }
    // this.label = this.label + ' (выбор)';
    this.label = this.label;

    if (!this.formElementName) {
      this.formElementName = 'refItem' + (this.source) ? this.source : '' + (Math.random() * 1000000).toFixed();
    }

    // console.log('SEL ngOnInit:', this.dtView, this.dtReqParams);
  }

  ngAfterViewInit() {
    // <HTMLElement>document.body.appendChild(this.tableContainer.nativeElement);
    // console.log('SEL ngAfterViewInit:', this.dtView, this.dtReqParams);
  }

  openModalDataTable(e) {
    e.preventDefault();

    // console.log('openModalDataTable', this.dataTable.source);
    this.visibleModal = true;
    this.dataTable.initKeyStates(DTKeysFocus.modal);

    this.openModalSelect.emit({
      component: this,
      table: this.dataTable
    });

    // initKeyStates change the state some mSecs
    setTimeout(() => {
      this.dataTable.triggerReload();
    }, 150);
  }

  refElementSelected(item) {
    if (item) {
      this.rcValue = this.shared.fillObject(item, this.rcValue, false);
      debugLog('--------- refElementSelected', this.rcValue);
      this.selected.emit(this.rcValue);
    } else {
      console.log('Empty element selected');
    }

    this.visibleModal = false;
    this.dataTable.initKeyStates(DTKeysFocus.none);
    this.closeModalSelect.emit({
      component: this,
      table: this.dataTable
    });

    setTimeout(() => {
      $('input').change();
    }, 150);
  }

  refElementCancelSelect() {
    this.visibleModal = false;
    this.dataTable.initKeyStates(DTKeysFocus.none);
    this.closeModalSelect.emit({
      component: this,
      table: this.dataTable
    });
  }

  clearValue(e) {
    e.preventDefault();

    console.log('clearValue:', this.rcValue);
    if (this.rcValue) {
      const keys = Object.keys(this.rcValue);
      keys.forEach(key => {
        delete this.rcValue[key];
      });
      this.valueCleared.emit(this.rcValue);

      setTimeout(() => {
        $('input').change();
      }, 150);
    }
  }

  getRefObjectPresentation(obj: any, viewField?: string) {
    if (!obj || typeof obj !== 'object') {
      return '';
    }

    let val;
    if (viewField && obj[viewField]) {
      val = obj[viewField].trim();
    } else if (obj.fullName) {
      val = obj.fullName.trim();
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

    if (obj.parent && val) {
      if (obj.parent.name) {
        val = obj.parent.name.trim() + ' — ' + val;
      } else if (obj.parent.code) {
        val = obj.parent.code + ' — ' + val;
      } else if (obj.parent.id) {
        val = obj.parent.id + ' — ' + val;
      }
    }

    return val;
  }

  setListCriteria() {
    if (this._listCriteria && typeof this._listCriteria === 'object') {
      this.dtReqParams.criteria = this._listCriteria;
      // console.log(`REF SELECT ${this.source}, criterias:`, this._listCriteria);
    } else {
      console.log(`REF SELECT ${this.source}: criterias is null`);
      this.dtReqParams.criteria = {};
    }

    if (this.dtView.autoReload) {
      this.dataTable.triggerReload();
    }
  }

}

