import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  OnInit,
  TemplateRef, ViewChild
} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {
  DataTableRequestParams,
  DataTableView, defaultDataTableRequestStates, defaultDataTableViewStates, DTKeysFocus,
  DTViewTypes
} from '../../classes/tables';
import {DataTableComponent} from '../../data-table/components/table';
import {defaultMailContextMenu} from '../../classes/constants';
import {AlertsModule} from '../../alerts/alerts.module';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {defaultOrderStatuses, OrderStatuses} from '../../classes/selectobjects';
import {ApiResponse} from '../../classes/responses';
import {alertsTypes, FileCategory} from '../../classes/types';
import {mailDocument} from '../../classes/datamodels';
import {debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  dtView: DataTableView;
  dtRequest: DataTableRequestParams;
  contextMenu = defaultMailContextMenu;
  orderStatuses: OrderStatuses[] = defaultOrderStatuses;

  public sharedservice;

  waiting = false;
  user = null;

  modeHTML = true;
  mail = mailDocument;

  constructor(private elem: ElementRef,
              private shared: SharedService,
              private api: ApiService,
              private router: Router,
              private auth: AuthService) {
    this.user = this.auth.loadUserFromStorage(false);

    this.sharedservice = shared;

    this.dtView = this.shared.copyObject(defaultDataTableViewStates);
    this.dtRequest = this.shared.copyObject(defaultDataTableRequestStates);
    this.dtRequest.limit = 10;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dataTable.setChangeState(false);
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  afterOpenCard(item) {
    // console.log('time', item.stamp, typeof item.stamp, item.stamp instanceof Date);
    setTimeout((itm) => {
      const mailBody = <HTMLElement>this.elem.nativeElement.querySelector('.mail-body');
      const mailText = <HTMLElement>this.elem.nativeElement.querySelector('.mail-text');
      if (mailBody && mailText) {
        mailBody.innerHTML = '';
        if (itm && itm.body && itm.body.html) {
          mailBody.innerHTML = itm.body.html;

          const quotes = <HTMLElement>mailBody.querySelector('blockquote');
          if (quotes) {
            const par = quotes.parentNode;
            const showQuotes = <HTMLElement>document.createElement('a');
            showQuotes.innerText = 'Показать переписку';
            showQuotes.classList.add('show-quotes-link');
            showQuotes.addEventListener('click', () => {
              quotes.style.display = 'block';
              showQuotes.style.display = 'none';
            });
            par.appendChild(showQuotes);
            // removeChild(quotes);

            quotes.style.display = 'none';
          }
        }

        mailText.innerHTML = '';
        if (itm && itm.body && itm.body.text) {
          mailText.innerHTML = itm.body.text;
        }

        setTimeout(() => {
          mailBody.focus();
        }, 100);
      } else {
        console.log('No body:', mailBody);
      }

      this.dataTable.setChangeState(false);
    }, 300, item);
  }

  togleTextView() {
    this.modeHTML = !this.modeHTML;
    // console.log(this.modeHTML);
  }

  getAdressFrom(item: any, getName = true) {
    // console.log('from:', item.from);
    if (item && item.from) {
      return (item.from.name) ? item.from.name : '' + (item.from.address) ? ' <' + item.from.address + '>' : '';
      // if (getName) {
      //   if (item.from.hasOwnProperty('name')) {
      //     return item.from.name;
      //   } else {
      //     return item.from.address;
      //   }
      // } else {
      //   if (item.from.hasOwnProperty('address')) {
      //     return item.from.address;
      //   } else {
      //     return item.from.name;
      //   }
      // }
    } else {
      return '';
    }
  }

  beforeSave(obj) {
    console.log('beforeSave', obj);
  }


  inboxChange(e) {
    if (e.target.checked) {
      this.dataTable.addRequestCriteria({
        box: 'inbox'
      });
    } else {
      this.dataTable.addRequestCriteria({
        box: {$ne: 'inbox'}
      });
    }
  }

  mymailChange(e) {
    if (e.target.checked) {
      this.dataTable.addRequestCriteria({
        'editor.name': 'inbox'
      });
    } else {
      this.dataTable.removeRequestCriteria({
        'editor.name': 0
      });
    }
  }

  linkedChange(e) {
    if (e.target.checked) {
      this.dataTable.addRequestCriteria({
        linked: true
      });
    } else {
      this.dataTable.removeRequestCriteria({
        linked: {$ne: true}
      });
    }
  }

  selectMenuItem(e) {
    console.log('menu:', e.event);

    switch (e.event.id) {
      case 'get_order_in_work':
        // console.log('---------', e.item);
        this.createReestrOrder(e.item);
        break;
      case 'set_executed_flag':
        this.mailDoneFromList();
        break;
      default:
    }
  }

  async getMailDocument(obj) {
    if (!(obj && obj._id)) {
      return null;
    }

    try {
      const res: ApiResponse = await <Promise<ApiResponse>>this.api.getDocumentById(this.dataTable.source, obj._id)
        .catch(err => {
          throw err;
        });
      if (!(res && res.result === true && res.data)) {
        if (res.hasOwnProperty('message')) {
          throw new Error(res.message);
        } else {
          throw new Error('Ошибка в запросе');
        }
      }

      return this.shared.fillObject(res.data, this.mail);
      // console.log('getMailDocument:', mail);
    } catch (e) {
      this.waiting = false;
      console.error('getMailDocument:', e.message);
      AlertsModule.notifyMessage('Не удалось открыть выбранное письмо. Обновите страницу.');
      return null;
    }
  }

  async createReestrOrder(obj) {
    this.waiting = true;
    const mail: any = await this.getMailDocument(obj);
    if (!mail) {
      this.waiting = false;
      return;
    }

    try {
      const text = (mail.body) ? mail.body.text || mail.body.html : '';
      const item = {
        orderDate: new Date(),
        contractDate: new Date(),

        comment: (mail.subject) ? 'Письмо: ' + mail.subject : null,
        files: mail.files,

        hasFiles: this.shared.checkHasFiles(mail.files),
        user: this.shared.getObjectToFieldStore(this.user, 'users'),
        mailText: text,
        orderStatus: mail.orderType,

        creditType: 1,
        orderCreditType: 1
      };

      mail.user = item.user;

      let answer = await this.api.addDocument('reestr', item)
        .catch(err => {
          throw err;
        });
      if (!answer.result) {
        if (answer.message) {
          throw new Error(answer.message);
        } else {
          throw new Error('Ошибка сервера');
        }
      }
      // console.log('OK create order', answer);

      answer = await this.api.putDocument('mail', mail)
        .catch(err => {
          throw err;
        });
      if (!answer.result) {
        if (answer.message) {
          throw new Error(answer.message);
        } else {
          throw new Error('Не удалось сохранить письмо');
        }
      }

      // console.log('OK save mail', answer);
      this.router.navigateByUrl('/journal/reestr')
        .then(res => {
          debugLog('~~~ Navigated to reestr list');
        });

    } catch (e) {
      console.error('createReestrOrder:', e.message);
      AlertsModule.notifyDangerMessage('Не удалось создать документ. Повторите попытку');
    }
    this.waiting = false;
  }

  async mailDoneFromList(obj?) {
    if (!obj) {
      if (!(this.dataTable && this.dataTable.selectedRow && this.dataTable.selectedRow.item)) {
        AlertsModule.notifyMessage('Не выбрано письмо. Повторите попытку', alertsTypes.WARNING);
        return;
      } else {
        obj = this.dataTable.selectedRow.item;
      }
    }

    this.waiting = true;
    const mail: any = await this.getMailDocument(obj);
    if (!mail) {
      this.waiting = false;
      return;
    }

    try {
      console.log('mailDoneFromList:', obj);
      mail.user = this.shared.getObjectToFieldStore(this.user, 'users');
      const fileds = {
        _id: mail._id,
        user: this.shared.getObjectToFieldStore(this.user, 'users')
      };
      const answer = await <Promise<ApiResponse>>this.api.updateDocument('mail', fileds)
        .catch(err => {
          throw err;
        });
      if (answer.result) {
        AlertsModule.notifyMessage('Назначен ответственный: ' + this.user.name, alertsTypes.SUCCESS);
        this.dataTable.triggerReload();
      } else {
        throw new Error(answer.message);
      }
    } catch (e) {
      console.error('mailDoneFromList:', e.message);
      AlertsModule.notifyDangerMessage('Не удалось назначить ответственного. Повторите попытку');
    }
    this.waiting = false;
  }

  async mailDone(obj) {
    obj.user = this.shared.getObjectToFieldStore(this.user, 'users');

    this.dataTable.saveCard(true);
  }
}
