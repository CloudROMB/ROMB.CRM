import {AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataTableView, defaultDataTableViewStates, DTKeysFocus, DTViewTypes} from '../../classes/tables';
import {SharedService} from '../../services/shared.service';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {ApiResponse} from '../../classes/responses';
import {errorLog, debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  dtView: DataTableView;
  managerTtCriteria = {roles: {$elemMatch: {code: 'partners-manager'}}, active: true};
  dtViewTypes = DTViewTypes;
  docStructure = {
    partner: {},
    address: {
      value: ''
    },
    bank_account: {},
    brands: [],
    manager: {}
  };
  partnersFilter = {};

  applyPartnerListCriteria = {
    applyOrders: true,
    active: true
  };

  constructor(private shared: SharedService,
              private api: ApiService,
              private auth: AuthService) {
    // параметры табличного документа
    this.dtView = defaultDataTableViewStates;
    // this.dtView.autoReload = false;

  }

  ngOnInit() {

    // console.log('ngOnInit', this.shared.doc);

    if (!this.auth.user) {
      this.auth.loadUserFromStorage(false);
    }
    if (this.auth.user && this.shared.checkCredential('user_partner') && !this.shared.checkCredential('system_user_admin')) {
      this.partnersFilter = this.auth.user.partner;
      this.shared.updateInputs();
      this.filterSelected(this.partnersFilter, 'partner.id');
    }
    // console.log(this.partnersFilter, this.auth.user);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit', this.shared.doc);
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  filterSelected(obj, property) {
    // console.log('filterSelected', obj);
    const criteria = {};
    // criteria[property] = obj.id;

    criteria['partner.id'] = String(obj.id);
    console.log('filterSelected', criteria, property, obj);
    this.dataTable.addRequestCriteria(criteria);
    this.dataTable.triggerReload();
  }

  filterCleared(filter) {
    this.dataTable.removeRequestCriteria(['partner.id']);
    // this.dataTable.removeRequestCriteria([filter]);
    // this.dataTable.triggerReload();
  }

  beforeAddNew(table) {
    console.log('shared');
    table.newItem = {
      partner: this.partnersFilter,
      brands: [],
      bank_account: {}
    };
    this.shared.updateInputs();
  }

  /**
   * Обработка события выбора партнера
   * @param e
   * @param item
   */
  async onPartnerSelect(e, item) {
    if (e && e.id && item && item.brands.length === 0) { // Если брендов до этого не было
      const brand = await this.getLastPartnerBrand(e.id);
      if (brand) {
        const brandsChanged: boolean = this.isBrandChanged(item);

        if (brandsChanged) {
          item.brands.push(brand);
        } else {
          item.brands[item.brands.length - 1] = brand;
        }
      }
    }
  }

  /**
   * Получить последний используемый бренд партнера
   * @param partnerId
   */
  async getLastPartnerBrand(partnerId) {
    const res: ApiResponse = await this.api.getDocumentById('partners', partnerId);
    if (res && res.result === true) {
      const brands = res.data && res.data.brands;
      if (brands && brands.length > 0) {
        return this.shared.copyObject(brands[brands.length - 1]);
      } else {
        return {};
      }
    } else {
      errorLog('Не удалось получить документ партнера');
      return false;
    }
  }

  selectAddress(obj) {
    if (this.dataTable && this.dataTable.item) {
      this.dataTable.item.address = obj;
    }
  }

  /**
   * Обработка события при выборе Бренда
   * @param e
   * @param item
   */
  onSelectBrand(e, item): void {

    const brand = {
      id: e.id || '',
      name: e.name || '',
      date: new Date().toISOString()
    };

    item.brand = this.shared.copyObject(brand);
    const brandsChanged: boolean = this.isBrandChanged(item);
    if (brandsChanged) {
      item.brands.push(brand);
    } else {
      item.brands[item.brands.length - 1] = brand;
    }
  }

  /**
   * Получить значение для поля  бренд
   * @param item
   */
  getBrandValue(item) {
    if (item && item.brands.length > 0) {
      return this.shared.copyObject(item.brands[item.brands.length - 1]);
    }
  }

  /**
   * Проверка менялся ли бренд без сохранения катрочки
   * @param item
   */
  isBrandChanged(item): boolean {
    const copyItem = this.dataTable.getCopyItem();
    if (copyItem && copyItem.brands) {
      return this.shared.compareObjects(item.brands, copyItem.brands);
    } else {
      return false;
    }
  }
}
