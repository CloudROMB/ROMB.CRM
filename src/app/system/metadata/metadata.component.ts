import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DataTableView, defaultDataTableViewStates, DTKeysFocus, DTViewTypes} from '../../classes/tables';
import {SharedService} from '../../services/shared.service';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {defaultCollectionTypes} from '../../classes/constants';
import {ApiService} from '../../services/api.service';
import {
  MetadataDocument,
  defaultMetadataField,
  defaultMenuGroup,
  defaultMenuLink,
  defaultCredentialGroup, defaultCredentialElement
} from '../../classes/datamodels';
import {debugLog} from '../../app.log';
import {alertsTypes, MULKeyValue, MULKeyValueCategory} from '../../classes/types';
import swal from 'sweetalert2';
import {AlertsModule} from '../../alerts/alerts.module';

declare const $: any;

@Component({
  selector: 'romb-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit, AfterViewInit, AfterViewChecked {
  collectionTypes = defaultCollectionTypes;

  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  doc = MetadataDocument;
  dtView: DataTableView;
  dtViewTypes = DTViewTypes;

  constructor(private shared: SharedService,
              private api: ApiService,
              private cdr: ChangeDetectorRef) {

    // параметры табличного документа
    this.dtView = defaultDataTableViewStates;
    this.dtView.showExpandableRows = false;
  }

  ngOnInit() {
    // console.log('ngOnInit', this.shared.doc);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit', this.shared.doc);
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
    // this.cdr.detectChanges();
  }

  getObjJSON(obj: any, property: string): string {
    // return this.shared.getObjJSON(this.dataTable.item.props, true);
    return this.shared.getObjJSON(obj[property], true);
  }

  saveProps(val) {
    // console.log('saveProps', val);
    if (val) {
      const arr = this.shared.getArrayFromJSON(val);
      if (arr && arr instanceof Array && arr.length) {
        this.dataTable.item.props = arr;
        this.dataTable.setChangeState();
      } else {
        console.log('ERROR saveProps: wrong value');
      }
    } else {
      // console.log('ERROR saveProps: empty value');
    }
  }

  changeCardProperty(obj: any, property: string): void {
    this.dataTable.changeCardProperty(obj, property);
  }

  beforeAddNew(table) {
    debugLog('METADATA beforeAddNew', table);
    // table.newItem
  }

  afterOpen(doc) {
    // debugLog('METADATA afterOpen', doc);

    // update properties objects with new fields
    if (doc && Array.isArray(doc.props)) {
      const tempProps = this.shared.copyObject(doc.props).map(el => {
        const inProp = SharedService.sortObject(el);
        const outProp = SharedService.sortObject(el);
        Object.keys(defaultMetadataField).forEach(key => {
          if (!outProp.hasOwnProperty(key)) {
            // debugLog('~~~ added', key);
            outProp[key] = defaultMetadataField[key];
          }
        });
        if (!this.shared.compareObjects(inProp, outProp)) {
          // debugLog('~~~ outProp.', outProp.name);
          return SharedService.sortObject(outProp);
        } else {
          return el;
        }
      });
      if (!this.shared.compareObjects(doc.props, tempProps)) {
        debugLog('~~~ props field updated');
        doc.props = this.shared.copyObject(tempProps);
      }
    }
  }

  collectionCodeChanged(ev, doc) {
    if (ev && ev.target && ev.target.value) {
    }
    // debugLog(ev);
  }

  /**
   * ADD metadata prepared element
   *
   * @async
   * @method beforeAddMetadataField
   * @param ev {object}
   *   @property {KeyValueComponent} component
   *   @property {MULKeyValue} parent
   *   @property {MULKeyValue} field
   */
  async beforeAddMetadataField(ev): Promise<void> {
    if (!(ev.component && ev.parent && ev.field)) {
      return;
    }
    ev.component.waitForEvent = true;

    if (ev.parent.name === 'root' && ev.field.category === MULKeyValueCategory.object) {
      const field = ev.component.dispatchVarObject(defaultMetadataField);
      ev.field.object = field.object;
    } else {
      AlertsModule.notifyMessage('Тип поля не допустим', alertsTypes.WARNING);
      ev.component.cancelEvent = true;
    }

    await this.shared.delay(50).then().catch();
    ev.component.waitForEvent = false;
  }

  /**
   * ADD credential group or element
   *
   * @async
   * @method beforeAddCredential
   * @param ev {object}
   *   @property {KeyValueComponent} component
   *   @property {MULKeyValue} parent
   *   @property {MULKeyValue} field
   */
  async beforeAddCredential(ev): Promise<void> {
    if (!(ev.component && ev.parent && ev.field)) {
      return;
    }
    ev.component.waitForEvent = true;

    debugLog('~~~ ev.parent', ev.parent);

    if (ev.field.category === MULKeyValueCategory.object) {
      if (ev.parent.name === 'root') {
        const field = ev.component.dispatchVarObject(defaultCredentialGroup);
        ev.field.object = field.object;
      } else if (ev.parent.name === 'credentials') {
        const field = ev.component.dispatchVarObject(defaultCredentialElement);
        ev.field.object = field.object;
      } else {
        AlertsModule.notifyMessage('Тип поля не допустим', alertsTypes.WARNING);
        ev.component.cancelEvent = true;
      }
    } else {
      AlertsModule.notifyMessage('Тип поля не допустим', alertsTypes.WARNING);
      ev.component.cancelEvent = true;
    }

    ev.component.waitForEvent = false;
  }

  /**
   * ADD menu group or link
   *
   * @async
   * @method beforeAddMenuField
   * @param ev {object}
   *   @property {KeyValueComponent} component
   *   @property {MULKeyValue} parent
   *   @property {MULKeyValue} field
   */
  async beforeAddMenuField(ev): Promise<void> {
    if (!(ev.component && ev.parent && ev.field)) {
      return;
    }
    ev.component.waitForEvent = true;

    if (ev.field.category === MULKeyValueCategory.object) {
      if (ev.parent.name === 'root') {
        this.dataTable.pushKeyState();
        this.dataTable.initKeyStates(DTKeysFocus.swal);

        const res = await swal({
          title: 'Выберите тип пункта меню',
          text: '',
          type: 'question',
          animation: true,
          allowEnterKey: true,
          showCancelButton: true,
          confirmButtonClass: 'btn btn-info',
          cancelButtonClass: 'btn btn-success',
          confirmButtonText: 'Элемент',
          cancelButtonText: 'Группа',
          buttonsStyling: false
        })
          .then((x) => {
            debugLog('SWAL:', x);
            if (x.hasOwnProperty('value') && x.value === true) {
              return true;
            } else if (x.hasOwnProperty('dismiss') && x.dismiss === swal.DismissReason.cancel) {
              return false;
            } else {
              return null;
            }
          })
          .catch((err) => {
            debugLog('ERROR SWAL:', err);
            // swal.noop;
            return null;
          });
        this.dataTable.popKeyState();

        if (res === true) {
          const field = ev.component.dispatchVarObject(defaultMenuLink);
          ev.field.object = field.object;
        } else if (res === false) {
          const field = ev.component.dispatchVarObject(defaultMenuGroup);
          ev.field.object = field.object;
        } else {
          ev.component.cancelEvent = true;
        }
      } else if (ev.parent.name === 'children') {
        const field = ev.component.dispatchVarObject(defaultMenuLink);
        ev.field.object = field.object;
      } else {
        AlertsModule.notifyMessage('Тип поля не допустим', alertsTypes.WARNING);
        ev.component.cancelEvent = true;
      }
    } else {
      AlertsModule.notifyMessage('Тип поля не допустим', alertsTypes.WARNING);
      ev.component.cancelEvent = true;
    }

    ev.component.waitForEvent = false;
  }
}
