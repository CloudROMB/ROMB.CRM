import {
  AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2,
  ViewChild
} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {
  DataTableRequestParams,
  DataTableView,
  defaultDataTableViewStates,
  DTKeysFocus,
  DTViewTypes
} from '../../classes/tables';
import {DocumentObject, UserStatuses} from '../../classes/data';
import {ApiResponse} from '../../classes/responses';
import {AlertsModule} from '../../alerts/alerts.module';
import {ApiService} from '../../services/api.service';
import {genders} from '../../classes/types';
import {FormControl} from '@angular/forms';
import {defaultContextMenu} from '../../classes/constants';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {RefSelectComponent} from '../../components/refselect/refselect.component';
import {debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  source = 'users';
  showPartners = false;
  showDepartments = false;
  contextMenuModal = defaultContextMenu;

  dtView: DataTableView;
  partnersView: DataTableView;
  departmentsView: DataTableView;
  departmentParent: any = {};

  dtKeysFocus = DTKeysFocus;

  doc = {
    name: '',
    FIO: {
      fullName: ''
    }
  };

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

  @ViewChild('mainList') dataTable: DataTableLiteComponent;
  @ViewChild('rspartner') rsPartner: RefSelectComponent;
  @ViewChild('rsdepartment') rsDepartment: RefSelectComponent;

  constructor(private renderer: Renderer2,
              private api: ApiService,
              private shared: SharedService) {
    this.dtView = shared.copyObject(defaultDataTableViewStates);
    // this.dtView.expandablePropery = 'source';

    this.partnersView = shared.copyObject(defaultDataTableViewStates);
    // this.partnersView.autoReload = false;

    this.departmentsView = shared.copyObject(defaultDataTableViewStates);
    // this.departmentsView.autoReload = false;
  }

  async ngOnInit() {
    // console.log('TABLE init:', this.dataTable);

    //  получение ролей
    this.api.getRefList('roles', {criteria: {active: true}})
      .then(resp => {
        // console.log('getToDos', resp);
        if (resp) {
          const res = <ApiResponse>resp;
          if (res.result === true) {
            debugLog('GOT ROLES:', resp);
            this.allRoles = res.data.list;
          } else {
            console.log('Roles Error:', res.message);
            AlertsModule.notifyMessage('Не удалось получить данные. Обновите страницу.');
          }
        }
      });
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.dataTable.item, this.doc);
  }

  ngOnDestroy() {
  }

  // РОЛИ
  onRoleItemSelect(item: any) {
    console.log(item);
    console.log(this.roles);
  }

  OnRoleItemDeSelect(item: any) {
    console.log(item);
    console.log(this.roles);
  }

  onRoleSelectAll(items: any) {
    console.log(items);
  }

  onRoleDeSelectAll(items: any) {
    console.log(items);
  }

  getActiveTitle() {
    if (this.dataTable && this.dataTable.item) {
      if (this.dataTable.item.active) {
        return UserStatuses.active;
      } else {
        return UserStatuses.blocked;
      }
    } else {
      return '';
    }
  }

  getFullName() {
    if (this.dataTable && this.dataTable.item) {
      if (this.dataTable.item.FIO) {
        return this.dataTable.item.FIO.fullName;
      } else {
        return this.dataTable.item.name;
      }
    } else {
      return '';
    }
  }

  getGender() {
    if (this.dataTable && this.dataTable.item) {
      if (this.dataTable.item.FIO && this.dataTable.item.FIO.gender) {
        switch (this.dataTable.item.FIO.gender) {
          case genders.MALE:
            return 'МУЖ';
          case genders.FEMALE:
            return 'ЖЕН';
          case genders.OTHER:
            return 'ДРУГОЙ';
          default:
            return '—';
        }
      } else {
        return '—';
      }
    } else {
      return '—';
    }
  }

  selectUserName(obj) {
    if (!obj) {
      console.log('ERROR FIO data', obj);
      return false;
    } else {
      console.log('FIO data', obj);
      obj.fullName = obj.unrestricted || obj.selected;
      this.dataTable.item.FIO = obj;
      if (!this.dataTable.item.name) {
        this.dataTable.item.name = obj.fullName;
      }
    }
    this.shared.updateInputs();
  }

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

  roleChange(e) {
    // console.log('+', e, this.dataTable.item.roles);
  }

  async beforeSave(event) {
    const doc = event.doc;
    const table = event.table;

    if (!(doc.login && typeof doc.login === 'string' && doc.login.trim())) {
      AlertsModule.notifyDangerMessage('Не указан «Логин пользователя CRM»');
      table.allowSave = false;
      return;
    }

    if (!doc._id && !doc.password) {
      AlertsModule.notifyDangerMessage('Не указан «Пароль»');
      table.allowSave = false;
      return;
    }

    if (doc.password && doc.password.length < 8) {
      AlertsModule.notifyDangerMessage('Пароль должен соджержать не менее 8 символов');
      table.allowSave = false;
      return;
    }

    if (!(SharedService.isRefObjectSelected(doc.partner) && SharedService.isRefObjectSelected(doc.department))) {
      AlertsModule.notifyDangerMessage('Укажите компанию и подразделение пользователя');
      table.allowSave = false;
      return;
    }

    if (!(doc.roles && doc.roles instanceof Array && doc.roles.length > 0)) {
      AlertsModule.notifyDangerMessage('Выберите хотя бы одну роль');
      table.allowSave = false;
      return;
    }

    if (doc.login !== doc.login.toLowerCase()) {
      doc.login = doc.login.toLowerCase().trim();
    }

    try {
      const logins = await this.api.getRefCount('users',
        {
          excludeID: doc._id,
          deleted: false,
          criteria: {
            login: doc.login
          }
        })
        .catch(err => {
          throw new Error('beforeSave Users: ' + err.message);
        });

      console.log('+++ users: ', logins, doc._id);
      if (logins && typeof logins.count === 'number' && logins.count > 0) {
        AlertsModule.notifyDangerMessage(`Пользователь с логином ${doc.login} уже существует`);
        table.allowSave = false;
        return;
      }
    } catch (err) {
      console.log(err.message);
      table.allowSave = false;
      return;
    }

    table.allowSave = true; // to improve saving speed
  }

  editClick(doc) {
    // if (doc) {
    //   this.changePartner(doc.partner);
    // }
  }

  afterOpen(doc) {
    // console.log('+', e);
  }

  compareRolesWith(role1, role2): boolean {
    // console.log('--------', Math.random());
    return role1 && role2 ? role1.code === role2.code : role1 === role2;
  }

  // EXTENDED REFERENCES
  changePartner(item, val) {
    console.log('partner', val);

    if (item) {
      item.partner = val;
      item.department = null;
    }

    if (val && val.id) {
      this.departmentParent = {
        'partner.id': val.id,
        active: true
      };
    } else {
      this.departmentParent = null;
    }
    if (this.rsDepartment) {
      this.rsDepartment.rcValue = item.department;
      this.rsDepartment.listCriteria = this.departmentParent;
    }
  }

  selectDepartment(item, dep) {
    if (item) {
      item.department = dep;
      item.department.parent = item.partner;
    }
  }

  checkCredential(cred) {
    return this.shared.checkCredential(cred);
  }
}
