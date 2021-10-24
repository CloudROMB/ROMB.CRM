import {AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {SharedService} from '../services/shared.service';
import {
  DataTableColumn,
  DataTableRequestParams, DataTableRow,
  DataTableView, defaultDataTableRequestStates,
  defaultDataTableViewStates,
  DTKeysFocus, DTViewTypes
} from '../classes/tables';
import {defaultContextMenu} from '../classes/constants';
import {AuthService} from '../services/auth.service';
import {DataTableLiteComponent} from '../data-table/components/tablelite';
import {
  defaultDeliveryStatuses,
  defaultOrderStatuses,
  defaultPaymentStatuses, defaultPrintForms,
  OrderStatuses, PrintForms
} from '../classes/selectobjects';
import {DomSanitizer} from '@angular/platform-browser';
import {RefSelectComponent} from '../components/refselect/refselect.component';
import {AlertsModule} from '../alerts/alerts.module';
import {ApiService} from '../services/api.service';
import {alertsTypes, FileCategory, DataImage, logEventTypes} from '../classes/types';
import {ApiResponse} from '../classes/responses';
import {isNumber} from 'util';
import {reestrDocument} from '../classes/datamodels';
import {PrintFormsComponent} from '../print-forms/print-forms.component';
import {errorLog} from 'app/app.log';
import {createNumberMask} from 'text-mask-addons';
import {sanitize} from '../classes/utils';

declare const $: any;

@Component({
  selector: 'romb-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('mainList') dataTable: DataTableLiteComponent;
  @ViewChild('selectUser') selectUserList: DataTableLiteComponent;
  @ViewChild('selectBank') selectBanksList: DataTableLiteComponent;
  @ViewChild('changeOrderStatusLink') changeOrderStatusLinkElement: ElementRef;
  @ViewChild('changeStatusRejectionLink') changeStatusRejectionLinkElement: ElementRef;
  @ViewChild('changeStatusReturnLink') changeStatusReturnLinkElement: ElementRef;
  @ViewChild(PrintFormsComponent) printFormsCmp: PrintFormsComponent;
  @ViewChild('bankPan') bankPan: ElementRef;
  @ViewChild('bankOrderRows') bankOrder: ElementRef;

  dtView: DataTableView;
  dtReqParams: DataTableRequestParams;

  @ViewChild('refPartner') selectPartner: RefSelectComponent;
  @ViewChild('refDepartment') selectDepartment: RefSelectComponent;

  public telMaskInput = ['+', '7', ' ', '(', /[0-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public telMask = /\+7+ \([0-9]{3}\) [0-9]{3}-[0-9]{4}/;
  public currencyMask = createNumberMask({
    prefix: '',
    suffics: '',
    thousandsSeparatorSymbol: ' '
  });

  organizationDTReqParams: DataTableRequestParams;
  partnerDTReqParams: DataTableRequestParams;
  departmentDTReqParams: DataTableRequestParams;
  departmentEnabled = false;

  user;
  partner = {};
  department = {};
  departmentParent: any = {};

  contextMenu = '';
  contextMenuModal = defaultContextMenu;

  showUsers = false;
  usersView: DataTableView;
  showPartners = false;
  partnersView: DataTableView;
  showDepartments = false;
  departmentsView: DataTableView;
  showBanks = false;
  banksView: DataTableView;
  dtKeysFocus = DTKeysFocus;

  docStructure = reestrDocument;
  docItem: any;
  orderVisible = false;

  orderStatuses: OrderStatuses[] = defaultOrderStatuses;
  paymentStatuses = defaultPaymentStatuses;
  deliveryStatuses = defaultDeliveryStatuses;

  printForms = defaultPrintForms;

  rejectionStatuses = [
    this.shared.getOrderStatusByID(25),
    this.shared.getOrderStatusByID(60),
    this.shared.getOrderStatusByID(70),
    this.shared.getOrderStatusByID(80)
  ];
  defaultMaxWidth = 1000;
  bankPanMaxWidth = 1700;
  filesCheckLogs;
  @HostListener('document:keyup', ['$event']) onDocumentKeyUp(event) {
    if (!this.dataTable) {
      return;
    }
    // console.log('document:keyup', 'keyCode', event.keyCode,
    //   'Shift', event.shiftKey,
    //   'Cotrol', event.ctrlKey,
    //   'keyState', this.dataTable.keyState);

    // exec VIEW CARD keys
    switch (this.dataTable.keyState) {
      case DTKeysFocus.view:
        switch (event.keyCode) {
          case 13: // Enter
            if (event.ctrlKey) {
              if (this.dtView.type === DTViewTypes.edit) {
                // this.saveCard();
              } else {
                // this.closeCard(true);
              }
              SharedService.stopEvent(event);
            }
            return;
          case 27: // Escape
            this.closeOrderView();
            SharedService.stopEvent(event);
            return;
          case 82: // Shift + R
            console.log('????? 82');
            if (event.altKey) {
              if (this.docItem && this.docItem._id) {
                this.updateOrderView(this.docItem);
                SharedService.stopEvent(event);
                return;
              }
            }
        }
        break;
    }
    return;
  }

  constructor(public shared: SharedService,
              private api: ApiService,
              private domSanitizer: DomSanitizer,
              private auth: AuthService) {
    this.organizationDTReqParams = this.shared.copyObject(defaultDataTableRequestStates);
    this.organizationDTReqParams.criteria = {
      applyOrders: true,
      active: true
    };

    this.partnerDTReqParams = this.shared.copyObject(defaultDataTableRequestStates);
    this.partnerDTReqParams.criteria = {
      applyOrders: {$ne: true},
      active: true
    };

    this.departmentDTReqParams = this.shared.copyObject(defaultDataTableRequestStates);
    this.departmentDTReqParams.criteria = {
      active: true
    };

    this.user = this.auth.loadUserFromStorage(false);

    // параметры табличного документа
    this.dtView = shared.copyObject(defaultDataTableViewStates);
    this.dtView.showExpandableRows = false;
    this.dtReqParams = shared.copyObject(defaultDataTableRequestStates);
    this.dtReqParams.limit = 7;

    this.usersView = shared.copyObject(defaultDataTableViewStates);
    this.usersView.autoReload = false;

    this.partnersView = shared.copyObject(defaultDataTableViewStates);
    this.partnersView.autoReload = false;

    this.departmentsView = shared.copyObject(defaultDataTableViewStates);
    this.departmentsView.autoReload = false;

    this.banksView = shared.copyObject(defaultDataTableViewStates);
    this.banksView.autoReload = false;

    // console.log('constructor', this.docStructure);
  }

  ngOnInit() {
    // console.log('ngOnInit', this.docStructure);
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    if (this.dataTable && this.dataTable.item && this.dataTable.item.partner.id) {
      const partnerId = this.dataTable.item.partner.id;
      this.departmentParent = {
        'partner.id': partnerId,
        active: true
      };
    }
  }

  // select USERS reference
  // TODO: перенести функционал в table.ts

  userSelected(user) {
    // console.log('ref users se:', user);
    if (user && this.dataTable.item) {
      this.dataTable.item.user = user;
    } else {
      console.log('Empty user selected');
    }

    this.showUsers = false;
    this.selectUserList.initKeyStates(DTKeysFocus.none);
    this.dataTable.initKeyStates(DTKeysFocus.card);

    setTimeout(() => {
      $('input').change();
    }, 150);
  }

  userCancelSelect() {
    this.showUsers = false;
    this.selectUserList.initKeyStates(DTKeysFocus.none);
    this.dataTable.initKeyStates(DTKeysFocus.card);
  }

  bankSelected(item) {
    if (item && this.dataTable.item) {
      this.dataTable.item.bank = item;
    } else {
      console.log('Empty item selected');
    }

    this.showBanks = false;
    this.selectBanksList.initKeyStates(DTKeysFocus.none);
    this.dataTable.initKeyStates(DTKeysFocus.card);

    setTimeout(() => {
      $('input').change();
    }, 150);
  }

  bankCancelSelect() {
    this.showBanks = false;
    this.selectBanksList.initKeyStates(DTKeysFocus.none);
    this.dataTable.initKeyStates(DTKeysFocus.card);
  }

  onSubmit(cardForm: NgForm) {
    console.log(cardForm.value);  // { first: '', last: '' }
    // console.log(cardForm.valid);  // false
  }

  addNewClick(doc) {
    console.log('addNewClick', doc);

    // doc.orderStatus = this.statuses[1].val;
    doc.orderStatus = this.shared.getOrderStatusByID(20); // Назначен ответственный
    doc.creditType = 1; // КРЕДИТ
    // this.statusSelected = this.statuses[1].id;
    doc.orderDate = new Date();
    doc.contractDate = new Date();

    doc.user = {
      name: this.user.name,
      id: this.user._id,
      code: this.user.code,
      source: 'users'
    };

    console.log(doc.status);  // false
  }

  async editClick(doc) {
    if (!(doc.credentials && doc.credentials instanceof Array && doc.credentials.length)) {
      if (doc._id) {
        // console.log('CREDENTIALS: there are no rights to edit document', doc);
        console.log(['EDIT!!!!!!!!!!!!!', doc]);
        this.updateOrderView(doc);
      }
    } else {

    }
  }

  setActivePanelOrderView(doc) {
    if (doc.orderStatus && doc.orderStatus.id) {
      switch (doc.orderStatus.id) {
        case 50:
          console.log('+++', doc.hasContractBlank, doc.signStatus);
          if (doc.hasContractBlank) {
            if (doc.signStatus !== true) {
              setTimeout(() => {
                $('#view-sign-pan-header').click();
              }, 150);
            } else {
              setTimeout(() => {
                $('#view-files-pan-header').click();
              }, 150);
            }
          } else {
            if (true) {

            }
          }
          break;
        case 80:
          setTimeout(() => {
            $('#view-order-pan-header').click();
          }, 150);
          break;
        default:
          setTimeout(() => {
            $('#view-order-pan-header').click();
          }, 150);
      }
    } else {
      // $('#view-order-pan').classes();
      // $('#orderViewPans a:last').tab('show');
      // console.log('setActivePanelOrderView:', $('#view-customer-pan'));
    }

    // console.log('setActivePanelOrderView:', $('#view-customer-pan-header'));
    // view-customer-pan
    // view-files-pan-header
    // view-payment-pan-header
  }

  setVisiblePans(doc) {
    if (doc && doc.orderStatus && doc.orderStatus.id) {
      switch (doc.orderStatus.id) {
        case 50:
          if (doc.hasContractBlank === true && doc.signStatus !== true) {
            setTimeout(() => {
              $('#view-sign-pan-header').removeClass('hidden');
            }, 150);
          }
          break;
        default:
          $('#view-sign-pan-header').addClass('hidden');
      }
    } else {
      // $('#view-order-pan').classes();
      // $('#orderViewPans a:last').tab('show');
      // console.log('setActivePanelOrderView:', $('#view-customer-pan'));
    }
  }

  async updateOrderView(doc) {
    this.docItem = null;
    try {
      const res: ApiResponse = await <Promise<ApiResponse>>this.api.getDocumentById(this.dataTable.source, doc._id)
        .catch(err => {
          throw err;
        });
      // console.log('DOC by ID', this.source, res);
      if (!(res && res.result === true && res.data)) {
        if (res.hasOwnProperty('message')) {
          throw new Error(res.message);
        } else {
          throw new Error('Ошибка в запросе');
        }
      }
      // console.log('updateOrderView:', res.data, this.docStructure, this.shared.fillObject(res.data, this.docStructure));

      this.docItem = this.shared.fillObject(res.data, this.docStructure);
      // console.log('updateOrderView:', this.docItem);

      // не понимаю, зачем был этот код
      // if (this.docItem.files) {
      //   this.docItem.files = this.docItem.files.filter(el => {
      //     console.log(el.category, el.category === FileCategory.contract);
      //     return el.category === FileCategory.contract;
      //     // return true
      //   });
      // }
      this.docItem.orderStatusID = SharedService.getOrderStatusID(this.docItem);

      this.dataTable.pushKeyState();
      this.dataTable.initKeyStates(DTKeysFocus.view);
      this.orderVisible = true;

      this.setVisiblePans(this.docItem);
      this.setActivePanelOrderView(this.docItem);
      this.shared.updateInputs(500);
    } catch (e) {
      console.error('updateOrderView:', e.message);
      AlertsModule.notifyMessage('Не удалось открыть карточку. Обновите страницу.');
    }
  }

  closeOrderView() {
    this.dataTable.popKeyState();

    this.orderVisible = false;
    this.docItem = null;
  }

  afterReloadCard(doc) {
    if (doc) {

      setTimeout(() => {
        // console.log('@@@ changeOrderStatusLinkElement', this.changeOrderStatusLinkElement);
        if (this.changeOrderStatusLinkElement) {
          this.updateChangeStatusLinkElement(doc);
        }
      }, 500);
    } else {
      AlertsModule.notifyDangerMessage('Не удалось обновить карточку документа');
    }
  }

  afterOpen(doc) {
    // обновление документа партнера
    this.setPartner(doc.partner);
    this.setDepartment(doc.department);
    console.log('OPEN DOC:', doc);
    this.shared.updateInputs(500);
  }

  changeDirectContract(doc) {
    doc.directContract = true;
    doc.organization = this.shared.copyObject(doc.partner);
  }

  setHasContractBlank(doc) {
    let found = false;
    if (doc && doc.files && doc.files instanceof Array) {
      doc.files.forEach(group => {
        if (group.category === FileCategory.contract) {
          if (group.list && group.list instanceof Array && group.list.length > 0) {
            // console.log('beforeSave', group.category, FileCategory.contract);
            found = true;
          }
        }
      });
    }
    doc.hasContractBlank = found;
  }

  setHasSignedScans(doc) {
    let found = false;
    if (doc && doc.files && doc.files instanceof Array) {
      doc.files.forEach(group => {
        if (group.category === FileCategory.contractSigned) {
          if (group.list && group.list instanceof Array && group.list.length > 0) {
            // console.log('beforeSave', group.category, FileCategory.contract);
            found = true;
          }
        }
      });
    }
    doc.hasSignedScans = found;
  }

  beforeSave(event) {
    const doc = event.doc;
    const table = event.table;
    /**Приведение значений с подключенным textmask к нормальному состоянию*/
    doc.orderPurchaseSumm = sanitize(doc.orderPurchaseSumm);
    doc.orderInitialFee = sanitize(doc.orderInitialFee);

    if (doc && SharedService.isRefObjectSelected(doc.organization)) {
      doc.directContract = false;
    } else {
      doc.directContract = true;
      if (SharedService.isRefObjectSelected(doc.partner)) {
        doc.organization = this.shared.copyObject(doc.partner);
      } else {
        AlertsModule.notifyDangerMessage('Не выбран партнер');
      }
    }

    this.setHasContractBlank(doc);
    this.setHasSignedScans(doc);

    table.allowSave = true; // to improve saving speed
  }

  // ПОДСКАЗКИ
  selectCustomer(obj) {
    const doc = this.dataTable.item;
    // doc.customer = this.shared.fillObject(obj, doc.customer);
    doc.customer.fullName = obj.unrestricted || obj.selected;
    // console.log('selectCustomer', doc.customer, obj);
    this.shared.updateInputs();
  }

  selectCustomerAddress(obj) {
    const doc = this.dataTable.item;
    doc.customer.passportAddress = obj.unrestricted || obj.selected;
    this.shared.updateInputs();
  }

  getFullName() {
    if (this.dataTable && this.dataTable.item) {
      if (this.dataTable.item.FIO) {
        return this.dataTable.item.FIO.fullName;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  cellClicked(cell) {
    // console.log('cell', cell);
  }

  compareStatusesWith(status1, status2): boolean {
    return status1 && status2 ? status1.id === status2.id : status1 === status2;
  }

  getOrganizationName(row: DataTableRow, col: DataTableColumn) {
    let v = '';
    if (row && row.item && col && row.item[col.property] && typeof row.item[col.property] === 'object') {
      // console.log('colorOrderStatuses:', row.item[col.property]);
      switch (row.item[col.property].id) {
        // не назначена
        case 10:
          v = `<span class="fa fa-clock-o" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(10).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = '#777';
          break;
        // назначен ответствнный
        case 20:
          v = `<span class="fa fa-user" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(20).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = `royalblue`;
          break;
        // Завершено анкетирование
        case 30:
          col.color = 'darkseagreen';
          break;
        // Рассматривается
        case 40:
          v = `<span class="fa fa-clock-o" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(40).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = `blueviolet`;
          break;
        // отказ
        case 50:
          v = `<span class="fa fa-times-circle" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(50).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'brown';
          break;
        // отказ
        case 60:
          v = `<span class="fa fa-times-circle" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(60).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'brown';
          break;
        // отказ
        case 70:
          v = `<span class="fa fa-times-circle" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(70).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'brown';
          break;
        //  кредит одобрен
        case 80:
          if (this.hasContractBlank(row.item)) {
            v = `<span class="fa fa-file-text-o" style="font-size: 24px;">
               </span><br>Скачать договор`;
          } else {
            v = `<span class="fa fa-check" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(80).name}`;
          }
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'green';
          break;
        //  кредит выдан
        case 90:
          v = `<span class="fa fa-check-circle-o" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(90).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'darkcyan';
          break;
        // Возврат товара
        case 100:
          v = `<span class="fa fa-undo" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(100).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'red';
          break;
        default:
          col.color = 'black';
      }
    }
  }

  colorOrganizationProperty(row: DataTableRow, col: DataTableColumn) {
    if (!(row && row.item && col)) {
      col.value = '';
      return;
    }

    if (!(row.item['orderStatus'] && typeof row.item['orderStatus'] === 'object' && row.item['orderStatus'].id)) {
      col.value = '';
      return;
    }

    const id = row.item['orderStatus'].id;
    const arr = [];
    defaultOrderStatuses.forEach(el => {
      if (el.id && el.showOrganization === true) {
        arr.push(el.id);
      }
    });

    if (!arr.includes(id)) {
      col.value = '';
      return;
    }
  }

  // раскраска колонки "Статус заявки"
  colorOrderStatuses(row: DataTableRow, col: DataTableColumn) {
    let v = '';
    if (row && row.item && col && row.item[col.property] && typeof row.item[col.property] === 'object') {
      // console.log('colorOrderStatuses:', row.item[col.property]);
      if (row.item.archive) {
        col.value = this.domSanitizer.bypassSecurityTrustHtml('Архив');
        // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
        col.color = `royalblue`;
        return;
      }

      switch (row.item[col.property].id) {
        // не назначена
        case 10:
          v = `<span class="fa fa-clock-o" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(10).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = '#777';
          break;
        // назначен ответствнный
        case 20:
          v = `<span class="fa fa-user" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(20).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = `royalblue`;
          break;
        // назначен ответствнный
        case 25:
          v = `<span class="fa fa-ban" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(25).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = 'brown';
          break;
        // Завершено анкетирование
        case 30:
          col.color = 'darkseagreen';
          break;
        // Рассматривается
        case 40:
          v = `<span class="fa fa-clock-o" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(40).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          // col.value = this.domSanitizer.bypassSecurityTrustStyle(col.value);
          col.color = `blueviolet`;
          break;
        // отказ
        case 60:
          v = `<span class="fa fa-times-circle" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(60).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'brown';
          break;
        // отказ
        case 70:
          v = `<span class="fa fa-times-circle" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(70).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'brown';
          break;
        // отказ
        case 80:
          v = `<span class="fa fa-times-circle" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(80).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'brown';
          break;
        //  кредит одобрен
        case 50:
          if (this.hasContractBlank(row.item)) {
            v = `
              <strong>${this.shared.getOrderStatusByID(50).name}</strong>
              <br>
              <span class="fa fa-file-text-o" style="font-size: 24px;">
              </span><br>Скачать договор`;
          } else {
            v = `
              <span class="fa fa-check" style="font-size: 24px;">
              </span><br>${this.shared.getOrderStatusByID(50).name}`;
          }

          // if (this.hasContractBlank(row.item)) {
          //   v = `<span class="fa fa-file-text-o" style="font-size: 24px;">
          //      </span><br>Скачать договор`;
          // } else {
          //   v = `<span class="fa fa-check" style="font-size: 24px;">
          //      </span><br>${this.shared.getOrderStatusByID(50).name}`;
          // }
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'green';
          break;
        //  кредит выдан
        case 90:
          v = `<span class="fa fa-check-circle-o" style="font-size: 24px;">
               </span><br>${this.shared.getOrderStatusByID(90).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'darkcyan';
          break;
        // Возврат товара
        case 100:
          v = `<span class="fa fa-undo" style="font-size: 24px;"></span><br>${this.shared.getOrderStatusByID(100).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'red';
          break;
        case 105:
          v = `<span class="fa fa-undo" style="font-size: 24px;"></span><br>${this.shared.getOrderStatusByID(105).name}`;
          col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
          col.color = 'red';
          break;
        //  кредит
        default:
          col.color = 'black';
      }
    }
  }

  // раскраска колонки "Подписание договора"
  colorSignStatuses(row: DataTableRow, col: DataTableColumn) {
    if (!(row && row.item && col)) {
      col.value = null;
      return;
    }
    // console.log('colorSignStatuses:', row.item);
    if (row.item.archive === true) {
      col.value = null;
      return;
    }
    if (row.item.hasContractBlank !== true) {
      col.value = null;
      return;
    }
    if (!(row.item['orderStatus'] && typeof row.item['orderStatus'] === 'object' && row.item['orderStatus'].id)) {
      col.value = null;
      return;
    }

    const id = row.item['orderStatus'].id;
    const arr = [];
    defaultOrderStatuses.forEach(el => {
      if (el.id && el.signStatus === true) {
        arr.push(el.id);
      }
    });
    if (!arr.includes(id)) {
      col.value = '';
      return;
    }

    if (row.item.signStatus === true) {
      // col.class = 'alert-success';
      col.color = 'black';
      col.backColor = 'lightgreen';
      col.value = 'Договор подписан';
    } else if (row.item.signStatus === false) {
      // col.class = 'alert-danger';
      col.color = 'white';
      col.backColor = 'brown';
      col.value = 'Клиент отказался подписать';
    } else {
      col.class = 'alert-danger';
      col.color = 'white';
      col.backColor = 'tomato';
      col.value = 'Подтвердите подписание договора';
    }
  }

  // раскраска колонки "Подгрузка файлов"
  colorHasSignedScans(row: DataTableRow, col: DataTableColumn) {
    if (!(row && row.item && col)) {
      col.value = null;
      return;
    }
    // console.log('colorSignStatuses:', row.item);
    if (row.item.archive === true) {
      col.value = null;
      return;
    }
    if (row.item.signStatus !== true) {
      col.value = null;
      return;
    }
    if (!(row.item['orderStatus'] && typeof row.item['orderStatus'] === 'object' && row.item['orderStatus'].id)) {
      col.value = null;
      return;
    }

    const id = row.item['orderStatus'].id;
    const arr = [];
    defaultOrderStatuses.forEach(el => {
      if (el.id && el.hasSignedScans === true) {
        arr.push(el.id);
      }
    });
    if (!arr.includes(id)) {
      col.value = '';
      return;
    }

    if (row.item.hasSignedScans === true) {
      // col.class = 'alert-success';
      col.color = 'black';
      col.backColor = 'lightgreen';
      col.value = 'Сканы загружены';
    } else {
      // col.class = 'alert-danger';
      col.color = 'white';
      col.backColor = 'tomato';
      col.value = 'Загрузите сканы';
    }
  }

  // раскраска колонки "Проверка КД"
  colorCheckScansStatus(row: DataTableRow, col: DataTableColumn) {
    if (!(row && row.item && col)) {
      col.value = null;
      return;
    }
    // console.log('colorScansStatus:', row.item);
    if (row.item.archive === true) {
      col.value = null;
      return;
    }
    if (row.item.hasSignedScans !== true) {
      col.value = null;
      return;
    }
    if (!(row.item['orderStatus'] && typeof row.item['orderStatus'] === 'object' && row.item['orderStatus'].id)) {
      col.value = null;
      return;
    }

    const id = row.item['orderStatus'].id;
    const arr = [];
    defaultOrderStatuses.forEach(el => {
      if (el.id && el.checkScansStatus === true) {
        arr.push(el.id);
      }
    });
    if (!arr.includes(id)) {
      col.value = '';
      return;
    }

    let v = '';
    if (row.item.checkScansStatus === true) {
      v = `<span class="fa fa-check" style="font-size: 24px;"></span>
           <br>Принято на оплату`;
      col.color = 'black';
      col.backColor = 'lightgreen';
    } else if (row.item.checkScansStatus === false) {
      v = `<span class="fa fa-times" style="font-size: 24px;"></span>
           <br>Не принято!`;
      col.color = 'white';
      col.backColor = 'tomato';
    } else {
      console.log(row.item.checkScansStatus, row)
      v = `<span class="fa fa-exclamation" style="font-size: 24px;"></span>
           <br>Нужно проверить`;
      col.color = 'red';
    }
    col.value = this.domSanitizer.bypassSecurityTrustHtml(v);
  }

  // раскраска колонки "Статус оплаты"
  colorPaymentStatuses(row: DataTableRow, col: DataTableColumn) {
    if (row && row.item && col && row.item[col.property] && typeof row.item[col.property] === 'object') {
      switch (row.item[col.property].id) {
        // Ожидает оплаты
        case 10:
          col.color = 'green';
          break;
        // Оплачено банком
        case 20:
          col.class = 'alert-success';
          col.color = 'black';
          break;
        // Оплачено
        case 30:
          col.class = 'alert-success';
          col.color = 'black';
          break;
        // Оплачено авансом
        case 40:
          col.class = 'alert-success';
          col.color = 'black';
          break;
        // Рассматривается
        case 50:
          col.class = 'alert-danger';
          col.color = 'black';
          break;
      }
    }
  }

  rowsRebuilded(rows) {
    // rows = this.dataTable.rows;
    console.log('ROWS:', rows);
    // console.time('Colors');
    rows.forEach(row => {
      if (row.columns) {
        row.columns.forEach(col => {
          switch (col.property) {
            case 'organization':
              this.colorOrganizationProperty(row, col);
              break;
            case 'orderStatus':
              this.colorOrderStatuses(row, col);
              break;
            case 'signStatus':
              this.colorSignStatuses(row, col);
              break;
            case 'hasSignedScans':
              this.colorHasSignedScans(row, col);
              break;
            case 'checkScansStatus':
              this.colorCheckScansStatus(row, col);
              break;
            case 'paymentStatus':
              this.colorPaymentStatuses(row, col);
              break;
            default:
          }
        });
      }
    });
    // console.timeEnd('Colors');
  }

  async partnerSelected(item) {
    if (item && item.partner && item.partner.id) {
      this.departmentEnabled = true;

      if (item.department) {
        if (!item.department.parent) {
          item.department = {};
        } else if (item.department.parent.id !== item.partner.id) {
          item.department = {};
        }

        if (!item.department.id) {
          //  получение подразделений, если не выбран
          const deps = await this.api.getRefList('departments',
            <DataTableRequestParams>{
              criteria: {
                'partner.id': item.partner.id,
                active: {$ne: false}
              }
            });
          // console.log('---------- ', deps);
          if (deps.result === true && deps.data.list) {
            if (deps.data.list.length === 1) {
              item.department = deps.data.list[0];
              item.department.parent = item.partner;
              // console.log('++++++++++ ', deps.data[0]);
              // console.log('++++++++++ ', item.department);

              this.shared.updateInputs();
            } else if (deps.data.list.length === 0) {
              this.departmentEnabled = false;
            }
          }
        }

        item.department.parent = this.shared.copyObject(item.partner);
        // console.log('++++++++++ ', item.department);

        this.selectDepartment.listCriteria = {
          'partner.id': item.partner.id,
          active: {$ne: false}
        };
      } else {
        AlertsModule.notifyDangerMessage('item.department:' + item.department);
      }
    } else {
      this.departmentEnabled = false;
      this.selectDepartment.listCriteria = {};
      item.department = {};
    }
  }

  hasContractBlank(doc) {
    // console.log('hasContractBlank:', doc);
    if (doc && doc.hasContractBlank === true) {
      return true;
    } else {
      return false;
    }
  }

  departmentSelected(item) {
    console.log('item.department', item.department);
  }

  partnerCleared(item) {
    this.departmentEnabled = false;
    this.selectDepartment.listCriteria = {};
    item.department = {};
  }

  async selectMenuItem(e) {
    // console.log('++++++++++++', e);
    if (e && e.event && e.event.id === 'apply' && e.item) {
      this.setStatusApplyUser(e.item);
    }
  }

  myDocumentsFilterChange(e) {
    if (e.target.checked) {
      this.dataTable.addRequestCriteria({
        $or: [
          {
            'author.id': String(this.user._id)
          },
          {
            'editor.id': String(this.user._id)
          },
          {
            'user.id': String(this.user._id)
          }
        ]
      });
    } else {
      this.dataTable.removeRequestCriteria({
        $or: 0
      });
    }
    this.dataTable.triggerReload();
  }

  creditOrderFilterChange(e) {
    if (e.target.checked) {
      this.dataTable.addRequestCriteria({
        $or: [
          {
            'author.id': String(this.user._id)
          },
          {
            'editor.id': String(this.user._id)
          },
          {
            'user.id': String(this.user._id)
          }
        ]
      });
    } else {
      this.dataTable.removeRequestCriteria({
        $or: 0
      });
    }
    this.dataTable.triggerReload();
  }

  updateChangeStatusLinkElement(doc) {
    if (!(this.changeOrderStatusLinkElement && this.changeStatusRejectionLinkElement && this.changeStatusReturnLinkElement)) {
      return;
    }
    const status = <HTMLElement>this.changeOrderStatusLinkElement.nativeElement;
    const reject = <HTMLElement>this.changeStatusRejectionLinkElement.nativeElement;
    const ret = <HTMLElement>this.changeStatusReturnLinkElement.nativeElement;
    if (status && reject && ret) {
      // если не указан статус заявки
      if (!(doc && doc.orderStatus && doc.orderStatus.id >= 0)) {
        reject.classList.add('hidden');
        ret.classList.add('hidden');
        status.classList.add('hidden');
        return;
      }

      // если документ в архиве
      if (doc.archive) {
        reject.classList.add('hidden');
        ret.classList.add('hidden');
        status.classList.remove('hidden');
        status.classList.remove('btn-danger');
        status.classList.remove('btn-warning');
        status.classList.remove('btn-success');
        status.classList.add('btn-primary');
        status.title = 'Изъять документ из архива';
        status.innerText = 'Изъять из архива';
        return;
      } else {
        status.classList.add('btn-success');
        status.classList.remove('btn-primary');
      }

      this.rejectionStatuses.forEach(el => {
        el.visible = false;
      });

      switch (doc.orderStatus.id) {
        case 0:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Установить статус "Назначить ответственного"';
          status.innerText = 'Взять в работу';
          break;
        case 10:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Установить статус "Назначить ответственного"';
          status.innerText = 'Взять в работу';
          break;
        case 20:
          reject.classList.remove('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Установить статус "Заявка отправлена в банк"';
          status.innerText = 'Отправлена';

          this.rejectionStatuses.forEach(el => {
            // Некорректная заявка
            if (el.id === 25) {
              el.visible = true;
            }
            // Отказ Клиента
            if (el.id === 60) {
              el.visible = true;
            }
          });

          break;
        case 25:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');

          status.title = 'Установить статус "Заявка отправлена в банк"';
          status.innerText = 'Отправлена';
          break;
        case 40:
          reject.classList.remove('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Кредит одобрен';
          status.innerText = 'Одобрен';

          this.rejectionStatuses.forEach(el => {
            // Отказ Клиента
            if (el.id === 60) {
              el.visible = true;
            }
            // Отказ FreshCredit
            if (el.id === 70) {
              el.visible = true;
            }
            // Отказ Банков
            if (el.id === 80) {
              el.visible = true;
            }
          });

          break;
        case 50:
          reject.classList.remove('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Кредит выдан';
          status.innerText = 'Выдан';

          this.rejectionStatuses.forEach(el => {
            // Отказ Клиента
            if (el.id === 60) {
              el.visible = true;
            }
            // Отказ FreshCredit
            if (el.id === 70) {
              el.visible = true;
            }
          });

          break;
        case 60:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Передать документ в архив! (изменения будут невозможны)';
          status.innerText = 'В архив';
          break;
        case 70:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Передать документ в архив! (изменения будут невозможны)';
          status.innerText = 'В архив';
          break;
        case 80:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Передать документ в архив! (изменения будут невозможны)';
          status.innerText = 'В архив';
          break;
        case 90:
          reject.classList.add('hidden');
          ret.classList.remove('hidden');
          status.classList.remove('hidden');
          status.title = 'Передать документ в архив! (изменения будут невозможны)';
          status.innerText = 'В архив';
          break;
        case 100:
          reject.classList.add('hidden');

          ret.classList.remove('hidden');
          ret.title = 'Установить статус "Возврат товара/услуги оформлен"';
          ret.innerText = 'Покупка возвращена';

          status.classList.add('hidden');
          // status.title = 'Передать документ в архив! (изменения будут невозможны)';
          // status.innerText = 'В архив';
          break;
        case 105:
          reject.classList.add('hidden');
          ret.classList.add('hidden');
          status.classList.remove('hidden');
          status.title = 'Передать документ в архив! (изменения будут невозможны)';
          status.innerText = 'В архив';
          break;
        default:
      }
    }
  }

  putNewStatusToDB(doc: any, fields: any, succMessage: string = 'OK') {
    return this.api.updateDocument('reestr', fields)
      .then(data => {
        if (data.result === true) {
          // this.dataTable.setChangeState(false);
          this.updateChangeStatusLinkElement(doc);
          // console.log('OK update document', answer);
          AlertsModule.notifyMessage(succMessage, alertsTypes.SUCCESS);
          this.dataTable.triggerReload();

          this.shared.updateInputs();
        } else {
          throw new Error(data.message);
        }
      })
      .catch(err => {
        throw err;
      });
  }

  async shiftOrderStatus(doc) {
    try {
      if (!this.dataTable) {
        throw new Error('Не инициализирована таблица документов');
      }

      if (!(doc && doc._id)) {
        throw new Error('Не выбран документ');
      }

      if (!(doc.orderStatus && doc.orderStatus.id >= 0)) {
        throw new Error('Статус заявки ну указан');
      }

      this.dataTable.pushKeyState();
      this.dataTable.initKeyStates(DTKeysFocus.swal);
      const answer = await AlertsModule.changeStatusAlert();
      this.dataTable.popKeyState();
      if (answer !== true) {
        return;
      }

      if (doc.archive) {
        this.removeStatusCreditArchive(doc);
        return;
      }

      switch (doc.orderStatus.id) {
        case 0:
          this.setStatusApplyUser(doc);
          break;
        case 10:
          this.setStatusApplyUser(doc);
          break;
        case 20:
          this.setStatusSentOrderToBank(doc);
          break;
        case 25:
          this.setStatusSentOrderToBank(doc);
          break;
        case 40:
          // doc.hasContractBlank = null;
          // doc.hasSignedScans = null;
          doc.signStatus = null;
          doc.checkScansStatus = null;
          doc.paymentStatus = null;
          doc.deliveryStatus = null;

          this.setStatusCreditApproved(doc);
          break;
        case 50:
          this.setStatusCreditIssued(doc);
          break;
        case 60:
          this.setStatusCreditArchive(doc);
          break;
        case 70:
          this.setStatusCreditArchive(doc);
          break;
        case 80:
          this.setStatusCreditArchive(doc);
          break;
        case 90:
          this.setStatusCreditArchive(doc);
          break;
        case 105:
          this.setStatusCreditArchive(doc);
          break;
      }
    } catch (err) {
      console.error('shiftOrderStatus:', err);
      AlertsModule.notifyMessage('Не удалось изменить статус');
    }
  }

  async setStatusSentOrderToBank(doc) {
    try {
      if (!this.shared.checkCredential('credit_order_status_send')) {
        throw new Error('Недостаточно прав для отправки документов');
      }

      const prevStatus = doc.orderStatus;
      const newStatus = this.shared.liftUpOrderStatus(doc, 40);
      if (!newStatus) {
        throw new Error('Не найден статус кредитной заявки');
      }

      if (prevStatus.id !== doc.orderStatus.id) {
        const fields = {
          _id: doc._id,
          orderStatus: doc.orderStatus
        };
        await this.putNewStatusToDB(doc, fields, 'Заявка отправлена в банк');
      }
    } catch (err) {
      console.error('setStatusSentOrderToBank:', err);
      AlertsModule.notifyMessage('Не удалось отправить заявку в банк');
    }
  }

  async setStatusCreditApproved(doc) {
    try {
      if (!this.shared.checkCredential('credit_order_status_approved')) {
        throw new Error('Недостаточно прав');
      }

      const newStatus = this.shared.liftUpOrderStatus(doc, 50);
      doc.creditSumm = (isNumber(doc.creditSumm) === true && doc.creditSumm > 0) ? doc.creditSumm : doc.orderSumm;
      if (!newStatus) {
        throw new Error('Не найден статус кредитной заявки');
      }
      const fields = {
        _id: doc._id,
        orderStatus: doc.orderStatus,
        creditSumm: doc.creditSumm
      };
      await this.putNewStatusToDB(doc, fields, `Кредит одобрен`);
    } catch (err) {
      console.error('setStatusCreditApproved:', err.message);
      AlertsModule.notifyMessage('Не удалось установить статус: ' + err.message);
    }
  }

  async setStatusCreditIssued(doc) {
    try {
      if (!this.shared.checkCredential('credit_order_status_issued')) {
        throw new Error('Недостаточно прав');
      }

      const newStatus = this.shared.liftUpOrderStatus(doc, 90);
      if (!newStatus) {
        throw new Error('Не найден статус кредитной заявки');
      }
      const fields = {
        _id: doc._id,
        orderStatus: doc.orderStatus
      };
      await this.putNewStatusToDB(doc, fields, `Кредит выдан`);
    } catch (err) {
      console.error('setStatusCreditIssued:', err.message);
      AlertsModule.notifyMessage('Не удалось установить статус: ' + err.message);
    }
  }

  async setStatusCreditArchive(doc) {
    try {
      if (!this.shared.checkCredential('credit_order_status_archive')) {
        throw new Error('Недостаточно прав');
      }

      doc.archive = true;
      const fields = {
        _id: doc._id,
        archive: doc.archive
      };
      await this.putNewStatusToDB(doc, fields, `Документ отправлен в архив`);
    } catch (err) {
      console.error('setStatusCreditArchive:', err.message);
      AlertsModule.notifyMessage('Не удалось установить статус: ' + err.message);
    }
  }

  async removeStatusCreditArchive(doc) {
    try {
      if (!this.shared.checkCredential('credit_order_status_from_archive')) {
        throw new Error('Недостаточно прав');
      }

      doc.archive = false;
      const fields = {
        _id: doc._id,
        archive: doc.archive
      };
      await this.putNewStatusToDB(doc, fields, `Документ изъят из архива`);
    } catch (err) {
      console.error('removeStatusCreditArchive:', err.message);
      AlertsModule.notifyMessage('Не удалось установить статус: ' + err.message);
    }
  }

  async setStatusApplyUser(doc) {
    try {
      if (doc.user && doc.user.id && !this.shared.checkCredential('credit_order_status_reapply_user')) {
        throw new Error('Недостаточно прав для назначения ответственного');
      }

      // Назначен ответственный
      const newStatus = this.shared.liftUpOrderStatus(doc, 20);
      if (!newStatus) {
        throw new Error('Не найден статус кредитной заявки');
      }
      const user = this.shared.getObjectToFieldStore(this.user, 'users');
      doc.user = user;

      const fields = {
        _id: doc._id,
        user: user,
        orderStatus: doc.orderStatus
      };
      await this.putNewStatusToDB(doc, fields, `Назначен ответственный: ${this.user.name}`);
    } catch (err) {
      console.error('setStatusApplyUser:', err);
      AlertsModule.notifyMessage('Не удалось назначить ответственного');
    }
  }

  async setReturnStatus(doc) {
    try {
      if (!this.dataTable) {
        throw new Error('Не инициализирована таблица документов');
      }

      if (!(doc && doc._id)) {
        throw new Error('Не выбран документ');
      }

      if (!(doc.orderStatus && doc.orderStatus.id >= 0)) {
        throw new Error('Статус заявки нe указан');
      }

      if (!this.shared.checkCredential('credit_order_status_return')) {
        throw new Error('Недостаточно прав');
      }

      let newStatus = null;
      if (doc.orderStatus.id < 100) {
        newStatus = this.shared.getOrderStatusByID(100);
      } else {
        newStatus = this.shared.getOrderStatusByID(105);
      }
      if (!newStatus) {
        throw new Error('Не найден статус кредитной заявки');
      }

      this.dataTable.pushKeyState();
      this.dataTable.initKeyStates(DTKeysFocus.swal);
      const answer = await AlertsModule.changeStatusAlert();
      this.dataTable.popKeyState();
      if (answer !== true) {
        return;
      }

      doc.orderStatus = newStatus;

      const fields = {
        _id: doc._id,
        orderStatus: doc.orderStatus
      };
      if (newStatus.id === 100) {
        await this.putNewStatusToDB(doc, fields, `Клиент обратился за возвратом товара/услуги`);
      } else {
        await this.putNewStatusToDB(doc, fields, `Клиент вернул товар/услугу`);
      }
    } catch (err) {
      console.error('setReturnStatus:', err);
      AlertsModule.notifyMessage('Не удалось установить статус "Возврат товара/услуги"');
    }
  }

  async setRejectionStatus(doc: any, statusID: number) {
    try {
      if (!this.dataTable) {
        throw new Error('Не инициализирована таблица документов');
      }

      if (!(doc && doc._id)) {
        throw new Error('Не выбран документ');
      }

      if (!(doc.orderStatus && doc.orderStatus.id >= 0)) {
        throw new Error('Статус заявки нe указан');
      }

      if (!this.shared.checkCredential('credit_order_status_reject')) {
        throw new Error('Недостаточно прав');
      }

      const newStatus = this.shared.liftUpOrderStatus(doc, statusID);
      if (!newStatus) {
        throw new Error(`Не найден статус кредитной заявки: ${statusID}`);
      }

      this.dataTable.pushKeyState();
      this.dataTable.initKeyStates(DTKeysFocus.swal);
      const answer = await AlertsModule.changeStatusAlert();
      // const answer = await this.shared.querySaveCard();
      this.dataTable.popKeyState();
      // continue to edit card
      if (answer !== true) {
        return;
      }

      const fields = {
        _id: doc._id,
        orderStatus: newStatus
      };
      await this.putNewStatusToDB(doc, fields, 'Установлен статус отказа от кредита');
    } catch (err) {
      console.error('setRejectionStatus:', err);
      AlertsModule.notifyMessage('Не удалось установить статус "Отказ кредита"');
    }
  }

  getOrderBuySumm(doc): number {
    if (doc.orderSumm && isNumber(doc.orderSumm)) {
      if (doc.orderInitialFee && isNumber(doc.orderInitialFee)) {
        return doc.orderSumm + doc.orderInitialFee;
      } else {
        return doc.orderSumm;
      }
    } else {
      return 0;
    }
  }

  getOrderCreditSumm(doc): number {
    console.log(doc);
    let orderSumm = 0;
    if (doc.orderPurchaseSumm && isNumber(doc.orderPurchaseSumm)) {
      if (doc.orderInitialFee && isNumber(doc.orderInitialFee)) {
        orderSumm = doc.orderPurchaseSumm - doc.orderInitialFee;
      } else {
        orderSumm = doc.orderPurchaseSumm;
      }
    } else {
      orderSumm = 0;
    }

    if (doc.orderSumm < 0) {
      orderSumm = 0;
    }

    if (doc.orderSumm !== orderSumm) {
      doc.orderSumm = orderSumm;
    }

    return orderSumm;
  }

  getSummCredit(doc): number {
    let summDelivery = 0;
    try {
      if (doc.orderDeliverySumm && isNumber(doc.orderDeliverySumm) && doc.orderDeliverySumm > 0) {
        summDelivery = doc.orderDeliverySumm;
      }
    } catch (e) {
      console.error('getSummDelivery:', e.message);
    }

    return summDelivery;
  }

  getSummDelivery(doc): number {
    let summDelivery = 0;
    try {
      if (doc.orderDeliverySumm && isNumber(doc.orderDeliverySumm) && doc.orderDeliverySumm > 0) {
        summDelivery = doc.orderDeliverySumm;
      }
    } catch (e) {
      console.error('getSummDelivery:', e.message);
    }

    return summDelivery;
  }

  getSummPurchase(doc): number {
    let summPurchase = 0;
    try {
      if (doc.orderPurchaseSumm && isNumber(doc.orderPurchaseSumm) && doc.orderPurchaseSumm > 0) {
        summPurchase = doc.orderPurchaseSumm;
      }
    } catch (e) {
      console.error('getSummPurchase:', e.message);
    }

    return summPurchase;
  }

  getSummInitialFee(doc): number {
    let summInitialFee = 0;
    try {
      if (doc.orderInitialFee && isNumber(doc.orderInitialFee) && doc.orderInitialFee > 0) {
        summInitialFee = doc.orderInitialFee;
      }
    } catch (e) {
      console.error('getSummInitialFee:', e.message);
    }

    return summInitialFee;
  }

  getSummSMS(doc): number {
    let summSMS = 0;
    try {
      if (doc.orderSMSSumm && isNumber(doc.orderSMSSumm) && doc.orderSMSSumm > 0) {
        summSMS = doc.orderSMSSumm;
      }
    } catch (e) {
      console.error('getSummSMS:', e.message);
    }

    return summSMS;
  }

  getSummInsurance(doc): number {
    let summInsurance = 0;
    try {
      if (doc.orderInsuranseSumm && isNumber(doc.orderInsuranseSumm) && doc.orderInsuranseSumm > 0) {
        summInsurance = doc.orderInsuranceSumm;
      }
    } catch (e) {
      console.error('getSummInsurance:', e.message);
    }

    return summInsurance;
  }

  getSummCommission(doc): number {
    let summCommission = 0;
    try {
      if (doc.orderCommissionSumm && isNumber(doc.orderCommissionSumm) && doc.orderCommissionSumm > 0) {
        summCommission = doc.orderCommissionSumm;
      }
    } catch (e) {
      console.error('getSummCommission:', e.message);
    }

    return summCommission;
  }

  panIsVisible() {
    return false;
  }

  checkCredential(cred) {
    return this.shared.checkCredential(cred);
  }

  changeFiles(doc, files) {
    if (doc && this.dataTable.changeFiles(doc, files) === true) {
      this.setHasContractBlank(doc);
      this.setHasSignedScans(doc);
    }
  }

  changePaymentDate(doc) {
    if (doc && !doc.paymentDate) {
      doc.paymentDate = new Date();
    }
  }

  async setSignStatus(doc, status: boolean, close: boolean = false) {
    try {
      if (!(doc && doc._id)) {
        throw new Error('Не выбран документ');
      }

      if (!(doc.orderStatus && doc.orderStatus.id >= 0)) {
        throw new Error('Статус заявки нe указан');
      }

      if (!this.shared.checkCredential('credit_order_status_signed')) {
        throw new Error('Недостаточно прав');
      }

      const fields: any = {
        _id: doc._id,
        checkScansStatus: null,
        signStatus: status
      };
      if (!status) {
        const newStatus = this.shared.getOrderStatusByID(60);
        if (!newStatus) {
          throw new Error(`Не найден статус кредитной заявки: Отказ клиента`);
        }
        fields.orderStatus = newStatus;
      }
      await this.putNewStatusToDB(doc, fields, 'Установлен статус подписания документов');

      if (close) {
        this.closeOrderView();
      }
    } catch (err) {
      console.error('setSignStatus:', err);
      AlertsModule.notifyMessage(err.message);
    }
  }

  async filesSaveChangesCkicked(doc, files) {
    try {
      if (!this.shared.checkCredential('journal_edit_files')) {
        throw new Error('Недостаточно прав');
      }

      if (!(doc && files)) {
        throw new Error('Нет файлов');
      }

      this.changeFiles(doc, files);
      const fields: any = {
        _id: doc._id,
        hasContractBlank: doc.hasContractBlank,
        hasSignedScans: doc.hasSignedScans,
        checkScansStatus: null,
        hasFiles: doc.hasFiles,
        files: files
      };
      // console.log('change files', fields);
      await this.putNewStatusToDB(doc, fields, 'Файлы сохранены. Сотрудник КЦ выполнит новую проверку сканов.');
    } catch (err) {
      console.error('needSaveChangesCkicked:', err);
      AlertsModule.notifyMessage(err.message);
    }
  }

  isCardInEditMode() {
    return ((this.dtView.type === DTViewTypes.edit) || (this.dtView.type === DTViewTypes.new));
  }

  printForm(formID: string): void {
    this.printFormsCmp.printTab(formID);
  }

  getPrintForm(formID: string): PrintForms {
    return this.shared.getPrintFormByID(formID);
  }

  async setPartner(partnerRef) {
    if (partnerRef.id) {
      const res: ApiResponse = await this.api.getDocumentById('partners', partnerRef.id);
      if (res.result && res.result === true && res.data) {
        this.partner = res.data;
      } else {
        errorLog(res.message);
      }
    } else {
      this.partner = {};
    }
  }

  async setDepartment(departmentRef) {
    if (departmentRef.id) {
      const res: ApiResponse = await this.api.getDocumentById('departments', departmentRef.id);
      if (res.result && res.result === true && res.data) {
        this.department = res.data;
      } else {
        errorLog(res.message);
      }
    } else {
      this.department = {};
    }
  }

  bankPanChange(event) {
  }

  /**
   * Применение отдельных стилей окна при переключении вкладки "Кредит"
   */

  onNavbarClick(e): void {
    const elem = e.target;
    if (elem.getAttribute('role') && elem.getAttribute('role') === 'tab') {
      const modalElem = elem.closest('div.card.document-card');
      const formElem = modalElem && modalElem.querySelector('form.dt-card-form');
      if (modalElem && formElem) {
        if (elem.parentElement.id === 'bank-pan-header') {
          modalElem.style.maxWidth = this.bankPanMaxWidth + 'px';
          formElem.style.overflowY = 'hidden';
        } else {
          modalElem.style.maxWidth = this.defaultMaxWidth + 'px';
          formElem.style.overflowY = 'auto';
        }
      }
    }
  }
  /**
   * Прокрутка до элемента
   * @param blockId
   */
  scrollToBlock(blockId): void {
    const bankOrderRow = this.bankOrder.nativeElement;
    const scrollBlock = bankOrderRow.querySelector('div.' + blockId);
    const coordY = scrollBlock.offsetTop;
    bankOrderRow.scrollTop = coordY;
  }

  /**
   * Событие при фокусе на полу "телефон"
   * @param e
   */
  onTelInputFocus(e) {
    const el = e.target;
    const value = el && el.value;
    const regexp = /\_/;
    const caretTarget = value.search(regexp);
    if (caretTarget >= 0) {
      setTimeout(() => {
        el.setSelectionRange(caretTarget, caretTarget);
      }, 100);
    }
  }

  /**
   * Раскрытие истории комментариев проверки файлов
   *
   */
  onFileCheckLogsOpen() {
    if (this.dataTable && this.dataTable.item && !this.dataTable.item.filesCheckLogs) {
      this.getFilesCheckLog();
    }
  }

  /**
   * Получить историю комментариев проверки файлов
   */
  async getFilesCheckLog() {
    if (this.dataTable.item && this.dataTable.item._id) {
      const itemId = this.dataTable.item._id;
      const logEventType = logEventTypes.files_check;
      const params = {
        objectID: itemId,
        logEventType: logEventType
      }
      try {
        const res: ApiResponse = await <Promise<ApiResponse>>this.api.getLogList({}, params)
        if (res && res.result === true) {
          this.filesCheckLogs = res.data.list;
        }
      } catch (error) {
        AlertsModule.notifyDangerMessage('Не удалось получить историю проверки файлов');
        throw new Error(error);
      }
    }
  }

  /**
   * Обработчик нажатия "добавить комментарий" вкладки "Контроль документов"
   * @param f
   */
  async onSubmitFileCheckLog(f: NgForm) {
    const message = f.value && f.value.filesCheckCommentItem;
    if (message) {
      const item = this.dataTable && this.dataTable.item;
      const itemId = item && item._id;
      const logEvent = logEventTypes.files_check;
      if (itemId && logEvent) {
        try {
          const params = {
            logEventType: logEvent,
            objectID: itemId,
            description: message
          };
          const res: ApiResponse = await <Promise<ApiResponse>>this.api.addLogRecord(params);
          if (res && res.result === true) {
            this.getFilesCheckLog();
            f.reset();
          } else {
            throw new Error(res.message);
          }
        } catch (error) {
          AlertsModule.notifyMessage('Не удалось добавить комментарий');
          throw new Error(error);
        }
      }
    } else {
      AlertsModule.notifyDangerMessage('Введите комментарий');
    }
  }

  /**
   * Обработка подтверждения корректности первичных документов
   * @param e
   */
  async onPrimaryFilesCheckChange(e) {
    if (e.checked) {
      const choice = await AlertsModule.saveAlert('Вы уверены?');
      if (choice === true) {
        const item = this.dataTable && this.dataTable.item;
        if (item) {
          try {
            item.primaryFilesChecked = true;
            // const itemId = item._id;
            // const logEvent = logEventTypes.files_check;
            // const message = logMessages.primary_correct;
            // const params = {
            //   logEventType: logEvent,
            //   objectID: itemId,
            //   description: message
            // };
            await this.dataTable.saveCard(false, false);
            // await this.api.addLogRecord(params);
          } catch (error) {
            this.dataTable.updateItemInfo(item._id, false);
            e.source.checked = false;
            throw new Error(error);
          }
        } else {
        }
      } else {
        e.source.checked = false;
        return;
      }
    }
  }

  isPrimaryFilesChecked(item) {
    console.log(item, item.primaryFilesChecked)
    return item && item.primaryFilesChecked;
  }

  onFileChange() {
    try {
      this.dataTable.saveCard(false, false);
      console.log();
    } catch (error) {
      throw new Error(error);
    }
  }

  onFileChangeFail() {
    const itemId = this.dataTable && this.dataTable.item && this.dataTable.item._id;
    if (itemId) {
      this.dataTable.updateItemInfo(itemId, false);
    }
  }
}
