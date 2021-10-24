import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import swal from 'sweetalert2';
import {SharedService} from '../../services/shared.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {ContractorStatuses} from '../../classes/data';
import {FreshfilesComponent} from '../../multielements/freshfiles/freshfiles.component';
import {EmployeesComponent} from '../../multielements/employees/employees.component';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {contractorDocument, bankAccountDocument} from '../../classes/datamodels';
import {UUID} from 'angular2-uuid';
import {isArray, isBoolean} from 'util';
import {ApiResponse} from '../../classes/responses';
import {compareDOB} from '../../classes/utils';
import {debugLog} from '../../app.log';

declare const $: any;

enum StateStatuses {
  ACTIVE = 'ACTIVE', // действующая
  LIQUIDATING = 'LIQUIDATING', // ликвидируется
  LIQUIDATED = 'LIQUIDATED' // ликвидирована}
}

@Component({
  selector: 'romb-contractors',
  templateUrl: './contractors.component.html',
  styleUrls: ['./contractors.component.scss']
})
export class ContractorsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public source = 'partners';
  public structureDoc: any = contractorDocument;
  public bankAccountItemStructure: any = bankAccountDocument;
  public isSoonBirthday = compareDOB;
  public titleTail = ['name'];
  brandCriteria: Object = {};
  customColsHide: Array<any> = []; // ['inn', 'departmentsCount', 'active'];
  blocking: Object;
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  @ViewChildren(FreshfilesComponent) files: QueryList<FreshfilesComponent>;

  departments: any;

  constructor(private shared: SharedService,
              private auth: AuthService,
              private api: ApiService,
              private cdr: ChangeDetectorRef) {

    if (!auth.user) {
      auth.loadUserFromStorage(false);
    }
    // console.log(auth.user);
  }

  ngOnInit() {
    // console.log('ngOnInit', this.shared.doc);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit', this.shared.doc);
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  async afterOpen(doc) {
    this.departments = [];
    // console.log('+++', this.files);
    this.files.toArray().forEach(files => {
      // console.log('+++');
      files.initPanel(doc.files);
    });
  }

  /**
   * Событие после загрузки карточки
   * @param event
   */
  async afterReloadCard(event) {
    // debugLog('~~~ afterReloadCard():', event);
    if (event && event._id) {
      try {
        const res: ApiResponse = await <Promise<ApiResponse>>this.api.getLogList({objectID: event._id})
          .catch(err => {
            throw err;
          });
        if (!(res.result === true && res.data)) {
          throw new Error(res.message);
        }
        debugLog('this.blocking = ', res.data.list);
        this.blocking = res.data.list;
      } catch (error) {
        return false;
      }
    }
  }

  async beforeSave(event) {
    const doc = event.doc;
    const table = event.table;

    doc.departmentsCount = 0;
    if (doc._id) {
      try {
        const deps = await this.api.getRefCount('departments',
          {
            criteria: {
              'partner.id': doc._id,
              'deleted': {$ne: true}
            }
          })
          .catch(err => {
            throw new Error('beforeSave Contractor: ' + err.message);
          });

        if (deps && typeof deps.count === 'number') {
          console.log('--- departmentsCount', deps);
          doc.departmentsCount = deps.count;
        }
      } catch (err) {
        console.error(err.message);
        table.allowSave = false;
        return;
      }
    }

    if (!doc.fullName || doc.fullName.length === 0) {
      $('#fullNameItem').focus();
      AlertsModule.notifyDangerMessage('Заполните поле Юридическое наименование организации');
      table.allowSave = false;
      return;
    }
    await this.setDepartmenBankAccounts(doc);
  }

  afterClose(event) {
    // console.log('---', this.files);
    this.files.toArray().forEach(files => {
      // console.log('---');
      files.clearPanel();
    });
  }

  selectCompany(obj: any) {
    const item = this.dataTable.item;
    if (!(obj && typeof obj === 'object')) {
      console.log('ERROR selectCompany', obj);
      AlertsModule.notifyDangerMessage('Выбрано неверное значение');
      return;
    }
    // console.log('dadata+:', obj, item.requisites.inn, obj.inn);
    if (item.requisites.hasOwnProperty('inn') && obj.hasOwnProperty('inn') && item.requisites && item.requisites.inn === obj.inn) {
      return;
    }

    item.requisites = this.shared.fillObject(obj, this.structureDoc.requisites);
    item.requisites.postaddress = this.shared.copyObject(item.requisites.address);

    item.name = obj.name.short || obj.name.short_with_opf;
    item.inn = obj.inn;
    // console.log('dadata name:', item.name, obj.name.short, obj.name.short_with_opf);

    try {
      if (obj.state && obj.state.actuality_date) {
        item.requisites.state.actuality_date = new Date(obj.state.actuality_date).toISOString().slice(0, 10);
      }

      if (obj.state && obj.state.registration_date) {
        item.requisites.state.registration_date = new Date(obj.state.registration_date).toISOString().slice(0, 10);
      }

      if (obj.ogrn_date) {
        item.requisites.ogrn_date = new Date(obj.ogrn_date).toISOString().slice(0, 10);
      } else {
        if (item.requisites.state && item.requisites.state.registration_date) {
          item.requisites.ogrn_date = item.requisites.state.registration_date;
        }
      }
    } catch (e) {
      console.log('ERROR dates convertation:', e);
    }

    if (obj.name) {
      item.fullName = obj.name.full_with_opf;
    } else {
      item.fullName = '';
    }
    item.opf = obj.opf.full;

    this.shared.updateInputs();
    console.log([obj, item]);
  }

  selectLegalAddress(obj) {
    // this.dataTable.item.requisites.address.data = obj;
    // console.log(this.dataTable.item);
    console.log('selected:', this.dataTable.item);
  }

  selectPostAddress(obj) {
    // this.dataTable.item.requisites.postaddress.data = obj;
    console.log('selected:', this.dataTable.item);
  }

  getActiveTitle(status) {
    if (status === true) {
      return ContractorStatuses.active;
    } else {
      return ContractorStatuses.blocked;
    }
  }

  changeContacts(contacts) {
    // console.log('CONTACTS change:', contacts);
    this.dataTable.item.contacts = contacts;
  }

  async showDepartments(item) {
    if (item && item._id) {
      this.departments = [];
      const res = await this.api.getRefList('departments', {
        criteria: {
          'partner.id': item._id,
          'deleted': {$ne: true}
        },
        cutFields: false
      });

      if (res && res.result) {
        this.departments = res.data.list;
        return res.data.list;
      }
    }
  }

  /**
   * Обработка события при выборе бренда
   * @param item
   * @param brand
   */
  async selectBrand(item, brand) {
    item.parent = brand;
    const choice = await AlertsModule.changeStatusAlert('Изменить у всех ТТ бренд автоматически ?');
    await this.dataTable.saveCard(false, false).catch(error => {
      AlertsModule.notifyMessage('При выборе бренда произошла ошибка.');
      return error;
    });
    if (choice === true) {
      try {
        const brandItem = {
          id: brand.id,
          name: brand.name,
          date: new Date()
        };

        item.brands.push(brandItem);

        const departments = await this.showDepartments(item)
          .catch(error => {
            return error;
          });
        if (departments) {
          this.departments.forEach(row => {
            if (row.brands && isArray(row.brands)) {
              row.brands.push(brandItem);
              const fields = {
                '_id': row._id,
                brands: row.brands
              };
              this.putFieldsToDepartment(fields).then();
            }
          });
        }
      } catch {
        AlertsModule.notifyMessage('Не удалось присвоить всем ТТ этот бренд.');
      }
    }
  }

  /**
   * @async
   * @method putFieldsToDepartment
   * @param {any} fields
   * @param {string} succMessage
   */
  async putFieldsToDepartment(fields: any, succMessage: string = 'OK') {
    return await this.api.updateDocument('departments', fields)
      .then(data => {
        if (data.result === true) {
          return data.message;
        } else {
          throw new Error(data.message);
        }
      })
      .catch(err => {
        throw err;
      });
  }

  /**
   * Установка банковских реквизитов всем ТТ
   * @param item
   */
  async setDepartmenBankAccounts(item) {
    try {
      const accountsArr: Array<any> = [];
      if (item.bank_accounts) {
        item.bank_accounts.forEach(row => {
          if (row.active === true) {
            accountsArr.push(row);
          }
        });
      }
      if (isArray(accountsArr) && accountsArr.length === 1) {
        const departments = await this.showDepartments(item)
          .catch(error => {
            return error;
          });
        if (departments) {
          this.departments.forEach(row => {
            const fields = {
              '_id': row._id,
              bank_account: accountsArr[0]
            };
            this.putFieldsToDepartment(fields).then();
          });
        }
      }
    } catch (error) {
      AlertsModule.notifyMessage('Не удалось присвоить всем единственно доступный реквизит');
    }
  }

  /**
   * Сохранение карточки
   */
  async saveRow() {
    await this.dataTable.saveCard();
  }

  /**
   * Проверка на новую запись
   * @param item
   */
  isNewRow(item) {
    return !(item._id && item._id.length > 0);
  }

  /**
   * Скопировать Юридический адрес в Фактический
   * @param item
   */
  copyFromAddress(item): void {
    item.requisites.actualaddress = this.shared.copyObject(item.requisites.postaddress);
    console.log(item);
  }

  /**
   * Выбор фактического адреса
   * @param event
   * @param item
   */
  onSelectActualAddress(event, item) {
    const address = {
      data: {},
      value: '',
      unrestricted_value: ''
    };
    address.data = this.shared.copyObject(event);
    address.value = event.value;
    address.unrestricted_value = event.unrestricted;
    item.requisites.actualaddress = this.shared.copyObject(address);
  }

  /**
   *
   */
  async saveItem() {
    await this.dataTable.saveCard(false, false);
  }

  async updateRows(id) {
    await this.dataTable.updateItemInfo(id, false);
  }

  makePartnerRef(item) {
    const partner = {
      code: item.code || '',
      id: item._id || '',
      name: item.name || '',
      source: 'partners'
    };
    return partner;
  }

  /**
   * Проверка разрешения для роли
   * @param credential
   */
  checkCrendential(credential) {
    return this.shared.checkCredential(credential);
  }
}
