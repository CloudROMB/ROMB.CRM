import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {ApiService} from '../../services/api.service';
import {ApiResponse} from '../../classes/responses';
import {userDocument} from '../../classes/datamodels';
import {FormControl} from '@angular/forms';
import {NgForm} from '@angular/forms';
import {AlertsModule} from '../../alerts/alerts.module';
import {generatePassword} from '../../classes/utils';
import {errorLog, debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-register-modal',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterModalComponent implements OnInit {
  // public structureDoc: any = userDocument;
  @Input() person;
  @Input() rolesCriteria;
  @Output() destroyWindow = new EventEmitter;
  item = this.shared.copyObject(userDocument);
  allRoles = [];
  roles = [];
  rolesControl = new FormControl();
  rolesDropdownSettings = {
    singleSelection: false,
    text: 'Выберите роли',
    searchPlaceholderText: 'Найти по наименованию',
    selectAllText: 'Выбрать все',
    unSelectAllText: 'Убрать все',
    enableSearchFilter: true,
    classes: ''
  };

  constructor(
    private shared: SharedService,
    private api: ApiService
  ) {
  }

  async ngOnInit() {
    this.item = await this.generateItem(this.person);
    const res: ApiResponse = await this.api.getRoles({credential: 'user_partner'});
    if (res && res.result === true && res.data) {
      this.allRoles = res.data;
    } else {
      errorLog('Roles Error:', res.message);
      AlertsModule.notifyMessage('Не удалось получить данные. Обновите страницу.');
    }
  }

  onSubmit(f: NgForm) {
    console.log('ORDER onSubmit:', f.value, this.item);

    // ФИО
    if (!(this.item && this.item.FIO && this.item.FIO.fullName)) {
      AlertsModule.notifyDangerMessage('Необходимо указать ФИО в контактах');
      return;
    }

    // Имя пользователя
    if (!(this.item && this.item.login)) {
      $('#itemUserName').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать имя пользователя для авторизации');
      return;
    }

    // Имя пользователя
    if (!(this.item && this.item.name)) {
      $('#itemShortName').focus();
      AlertsModule.notifyDangerMessage('Не указано короткое имя');
      return;
    }

    // Пароль
    if (!(this.item && this.item.password)) {
      AlertsModule.notifyDangerMessage('Необходимо ввести или сгенерировать пароль');
      return;
    }

    //  Роли
    if (!(this.item && this.item.roles && this.item.roles.length > 0)) {
      $('#itemRoles').focus();
      AlertsModule.notifyDangerMessage('Необходимо выбрать хотя бы одну роль');
      return;
    }

    if (!(this.item && this.item.department && this.item.department.name)) {
      console.log(this.item);
      $('#itemPasswd').focus();
      AlertsModule.notifyDangerMessage('Необходимо указать подразделение (торговую точку партнера) в контактах');
      return;
    }

    this.registerUser(this.item);
  }

  async registerUser(data) {
    const answer = await this.api.addDocument('users', data);
    if (answer && answer.result) {
      // if (answer.data && answer.data.ops && answer.data.ops[0] && answer.data.ops[0]._id) {
      if (answer.data && answer.data._id) {
        const uId = answer.data._id;
        const logParams = {
          logEventType: 'create',
          objectID: uId,
          description: data.comment || ''
        };
        await this.api.addLogRecord(logParams);
      }
      this.close();
    } else {
      const message = answer.message || 'Не удалось создать Пользователя. Повторите попытку';
      AlertsModule.notifyDangerMessage(message);
    }
  }

  close() {
    this.destroyWindow.emit();
  }

  /**
   * Создание объекта документа
   * @param person
   */
  generateItem(person) {
    const personObject = {
      contact_id: person.id || '',
      department: person.department || {},
      partner: person.partner || {},
      FIO: person.data || {},
      login: '',
      password: '',
      name: person && person.data && person.data.fullName || '',
      roles: [],
      active: true,
      comment: ''
    };

    return this.shared.copyObject(personObject);
  }

  /**
   *
   */
  async generatePasswd() {
    const password = await generatePassword();
    if (password) {
      this.item.password = password;
    }
  }

  /**
   *
   * @param role1
   * @param role2
   */
  compareRolesWith(role1, role2): boolean {
    // console.log('--------', Math.random());
    return role1 && role2 ? role1.code === role2.code : role1 === role2;
  }

  /**
   *
   */
  getRolesCodes() {
    let res = '';
    if (this.rolesControl && this.rolesControl.value && this.rolesControl.value.length) {
      this.rolesControl.value.forEach(el => {
        console.log('1', el);
        res += '<span> ' + el.code + '</span>';
        // el.forEach(rel => {
        //   console.log('2', rel);
        //   res += ' ' + rel.code;
        // });
      });
    }
    // console.log('+', res);
    return res;
  }

  /**
   *
   * @param e
   */
  roleChange(e) {
    // console.log('+', e, this.dataTable.item.roles);
  }

  /**
   * Получить значение поля "ТТ"
   * @param item
   */
  getItemDepartmentValue(item): string {
    let value;
    if (item && item.department && item.department.name) {
      value = item.department.name;
      if (item.partner && item.partner.name) {
        value += ' (' + item.partner.name + ')';
      }
    } else {
      value = 'TT Не выбрана';
    }

    return value;
  }
}
