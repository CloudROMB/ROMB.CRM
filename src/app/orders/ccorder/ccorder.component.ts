import {Component, OnInit, Input} from '@angular/core';
import {NgForm} from '@angular/forms';
import {FileCategory, SuggestionTypes, PrimaryFilesСategory} from '../../classes/types';
import {SharedService} from '../../services/shared.service';
import {defaultDataTableRequestStates} from '../../classes/tables';
import {AuthService} from '../../services/auth.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';
import {defaultOrderStatuses, OrderStatuses} from '../../classes/selectobjects';
import {isNumber, isObject} from 'util';
import {debugLog} from '../../app.log';
import {createNumberMask} from 'text-mask-addons';
import {sanitize} from '../../classes/utils';

declare const $: any;

@Component({
  selector: 'romb-ccorder',
  templateUrl: './ccorder.component.html',
  styleUrls: ['./ccorder.component.scss']
})
export class CCOrderComponent implements OnInit {
  // public telMaskInput = ['+', '7', ' ', '(', /[0-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  // public telMaskInput = ['+7 (', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  // public telMask = /\+7+ \([0-9]{3}\) [0-9]{3}-[0-9]{4}/;
  public telMaskInput = ['+', '7', ' ', '(', /[0-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];


  suggType = SuggestionTypes;

  orderStatuses: OrderStatuses[] = defaultOrderStatuses;
  customColsHide: Array<string> = ['code', 'name', 'partner']; // Массив с отключенными колонками
  departmentParent: any = {};
  departmentDTReq;
  defaultDisplayField;
  primaryFilesCategory = PrimaryFilesСategory;
  public currencyMask = createNumberMask({
    prefix: '',
    suffics: '',
    thousandsSeparatorSymbol: ' '
  });
  user: any;
  // orderTest = {
  //   orderDate: new Date(),
  //   partner: {
  //     id: '',
  //     name: ''
  //   },
  //   department: {
  //     id: '',
  //     name: ''
  //   },
  //   customer: {
  //     fullName: 'Михаил Степанович Свириденко'
  //   },
  //   phone: '+7 9103231511',
  //   creditType: 0,
  //   summ: 10001,
  //   orderPeriod: 0,
  //   orderFee: 9001,
  //   orderGoods: 'Рыбалка - 1,\nПалатки - 3,\nКонсервы - 45',
  //   comment: 'У матросов нет вопросов',
  //   agreement: false,
  //   orderType: {
  //     id: 10,
  //     name: 'Нужен ответственный!',
  //     descr: 'Нераспределенная заявка'
  //   },
  //   files: []
  // };

  order = {
    orderDate: new Date(),
    partner: {
      id: '',
      name: ''
    },
    department: {
      id: '',
      name: '',
      address: ''
    },
    customer: {
      fullName: ''
    },
    phone: '',
    creditType: 0,
    orderPeriod: 0,
    purchaseSumm: 0,
    orderFee: 0,
    orderGoods: '',
    comment: '',
    agreement: false,
    orderType: this.orderStatuses[1],
    files: []
  };

  constructor(private shared: SharedService,
              private auth: AuthService,
              private router: Router,
              private api: ApiService
  ) {
    this.departmentDTReq = this.shared.copyObject(defaultDataTableRequestStates);

    this.user = this.auth.loadUserFromStorage(false);

    if (this.user.partner && this.user.partner.id) {
      this.order.partner = this.shared.copyObject(this.user.partner);
      this.order.department = this.shared.copyObject(this.user.department);
      this.defaultDisplayField = this.user._department.address.value;
      this.departmentParent = {
        'partner.id': this.user.partner.id,
        active: true
      };
    }
  }

  ngOnInit() {
    this.shared.updateInputs();

    const firstel = <HTMLInputElement>document.querySelector('#fullNameItem');
    if (firstel) {
      firstel.focus();
    }

    console.log('Departments', this.order.department);
  }

  onSubmit(f: NgForm) {
    console.log('ORDER onSubmit:', f.value, this.order);


    // Partner
    if (!(this.order && this.order.partner && this.order.partner.id)) {
      $('#partnerItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать организацию партнера');
      return;
    }

    // Department
    if (!(this.order && this.order.department && this.order.department.id)) {
      $('#departmentItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать подразделение (торговую точку партнера)');
      return;
    }

    // customer fullname
    if (!(this.order && this.order.customer.fullName)) {
      $('#fullNameItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать ФИО покупателя');
      return;
    }

    // customer phone
    if (!(this.order && this.order.phone) || (this.order && this.order.phone && this.order.phone.search(/\_/) >= 0)) {
      $('#phoneItem').focus();
      AlertsModule.notifyDangerMessage('Неверно указан контактный телефон');
      return;
    }

    // purchase summ
    if (!(this.order && this.order.purchaseSumm)) {
      $('#orderSummItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать стоимость товара');
      return;
    }

    // credit type
    if (!(this.order && this.order.creditType)) {
      $('#creditTypeItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо выбрать тип заявки КРЕДИТ или РАССРОЧКА');
      return;
    }

    // credit period
    if (!(this.order && this.order.orderPeriod)) {
      $('#orderPeriodItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо выбрать желаемый срок кредита');
      return;
    }

    // order goods
    if (!(this.order && this.order.orderGoods)) {
      $('#orderGoodsItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать наменование товаров/услуг');
      return;
    }

    // Согласие
    if (!(this.order && this.order.agreement)) {
      $('#agreementItem').focus();
      AlertsModule.notifyDangerMessage('Необходимо подтвердить согласие на обработку персональных данных');
      return;
    }
    this.createReestrOrder(this.order);
  }

  onBeforeSaveOrder(order) {
    try {
      if (order.files) {
        order.files.forEach(category => {
          if (category.list) {
            category.list.forEach(file => {
              if (!file.description || (file.description && file.description.length === 0)) {
                file.description = category.category;
              }
            });
          }
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  selectFIO(obj: any) {
    this.order.customer = <any>this.shared.fillObject(obj, this.order.customer);
    this.order.customer.fullName = obj.unrestricted || obj.selected;
  }

  getReferencePresentation(item) {
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

    return '<' + val + '>';
  }

  async createReestrOrder(obj) {
    obj.customer.phone = obj.phone;
    obj.orderSumm = (isNumber(obj.purchaseSumm) ? obj.purchaseSumm : 0) - (isNumber(obj.orderFee) ? obj.orderFee : 0);
    const item = {
      orderDate: new Date(),
      contractDate: new Date(),
      partner: this.user.partner,
      department: this.user.department,
      custFullName: obj.fullName,
      customer: obj.customer,
      orderCreditType: obj.creditType,
      creditType: obj.creditType,
      orderPeriod: obj.orderPeriod,
      orderPurchaseSumm: sanitize(obj.purchaseSumm),
      orderInitialFee: sanitize(obj.orderFee),
      orderSumm: obj.orderSumm,
      orderGoods: obj.orderGoods,
      comment: obj.comment,
      hasAgreement: obj.agreement,
      files: obj.files,
      hasFiles: this.shared.checkHasFiles(obj.files),
      orderStatus: obj.orderType
    };
    item.department.parent = item.partner;

    // user: {
    //   name: this.user.name,
    //     id: this.user._id,
    //     code: this.user.code,
    //     source: 'users'
    // }
    await this.onBeforeSaveOrder(this.order);
    const answer = await this.api.addDocument('reestr', item);
    if (answer && answer.result) {
      // console.log('MAKE DOK', item, answer.data);
      // if (answer.data && answer.data.ops && answer.data.ops instanceof Array && answer.data.ops.length > 0 && answer.data.ops[0]._id) {
      if (answer.data && answer.data._id) {
        this.router.navigateByUrl(`/journal/reestr/${answer.data._id}`)
          .then(res => {
            debugLog('~~~ Navigated to reestr card');
          });
      } else {
        this.router.navigateByUrl('/journal/reestr')
          .then(res => {
            debugLog('~~~ Navigated to reestr list');
          });
      }
    } else {
      const message = answer.message || 'Не удалось создать документ. Повторите попытку';
      AlertsModule.notifyDangerMessage(message);
    }
  }

  selectElementText(el) {
    console.log('select', el);
    el.target.select();
  }

  changeFiles(doc, files) {
    // console.log('changeFiles', this.order.files, files);

    if (doc && files) {
      doc.files = files;
    }
  }

  /**
   * Обработка события при изменении значения поля "Телефон"
   * @param event
   */
  onPhoneInputChange(): void {
    // const telMask = /\+7/;
    // if (!telMask.test($('#phoneItem').val())){
    //   $('#phoneItem').val('+7');
    //   this.order.phone = '+7';
    // }
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
}
