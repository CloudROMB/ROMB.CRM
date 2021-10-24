import {AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {alertsTypes, defaultKeyValueLabels, MULKeyValue, MULKeyValueCategory, User} from '../../classes/types';
import {SharedService} from '../../services/shared.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {AuthService} from '../../services/auth.service';
import {debugLog} from '../../app.log';

@Component({
  selector: 'romb-key-value',
  templateUrl: './keyvaluearray.component.html',
  styleUrls: ['../multielements.scss']
})
export class KeyValueComponent implements OnInit, AfterViewInit, AfterViewChecked {
  labels = defaultKeyValueLabels;
  fieldCategory = MULKeyValueCategory;
  mulItem: MULKeyValue;
  updating = false;
  protected user: User;
  autoSaveChanges = true;

  /**
   * if TRUE it is possible to change structure in the visual (edit) mode
   */
  @Input() fixedStructure: boolean;

  /**
   * if FALSE it is not possible to edit key names in the visual (edit) mode
   */
  @Input() canEditField = true;

  /**
   * if TRUE it is possible to edit JSON in the VIEW mode
   */
  @Input() editJSON = false;

  /**
   * root object is Array or Object
   */
  @Input() isArray = true;

  private _mulValue: any;
  get mulValue(): any {
    let res: any;
    switch (this.mulItem.category) {
      case MULKeyValueCategory.array:
        res = this.getArrayValue(this.mulItem);
        break;
      case MULKeyValueCategory.object:
        res = this.getObjectValue(this.mulItem);
        break;
      default:
        res = this.mulItem.field;
    }

    // debugLog('+++', res);
    return res;
  }

  @Input() set mulValue(obj: any) {
    if (!this.shared.compareObjects(obj, this._mulValue)) {
      this._mulValue = obj;
      this.dispatchInitObject();
    }
  }

  @Input() textSize = 18;
  @Input() textTitle = 'Поля объекта';
  @Input() editMode = false;

  @Output() multiChange = new EventEmitter();
  @Output() modeStructureClicked = new EventEmitter();
  @Output() modeJSONClicked = new EventEmitter();
  @Output() saveStructureClicked = new EventEmitter();

  /**
   * @var {boolean} waitForEvent - the flag must be set for waiting in beforeXXX handlers
   */
  public waitForEvent: false;

  /**
   * @var {boolean} cancelEvent - if TRUE emmiter stop execution
   */
  public cancelEvent = false;

  /**
   * @param $event {object}
   *   @property {KeyValueComponent} component
   *   @property {MULKeyValue} parent
   *   @property {MULKeyValue} field
   */
  @Output() beforeAddField = new EventEmitter();

  getArrayValue(item: MULKeyValue): any {
    const res = [];
    if (item.object) {
      item.object.forEach(el => {
        switch (el.category) {
          case MULKeyValueCategory.field:
            // let fval = el.field;
            // if (/^\".+\"$/.test(String(el.field))) {
            //   fval = String(fval.slice(1));
            //   fval = String(fval.slice(0, -1));
            //   res.push(fval);
            // } else {
            //   res.push(el.field);
            // }
            res.push(el.field);
            break;
          case MULKeyValueCategory.object:
            res.push(this.getObjectValue(el));
            break;
          case MULKeyValueCategory.array:
            res.push(this.getArrayValue(el));
            break;
        }
      });
    }
    // if (el.)
    return res;
  }

  getObjectValue(item: MULKeyValue): any {
    const res = {};
    // const keys = Object.keys(item.object);
    // debugLog('---', keys.map(el => keys[el]));
    // keys.map(el => Object(item.object)[el]);

    if (item.object) {
      item.object.forEach(el => {
        if (!(el.name && el.name.trim())) {
          el.name = 'field' + (Math.random() * 1000000).toFixed(0).toString();
        }

        switch (el.category) {
          case MULKeyValueCategory.field:
            // let fval = el.field;
            // if (/^\".+\"$/.test(String(el.field))) {
            //   fval = String(fval.slice(1));
            //   fval = String(fval.slice(0, -1));
            //   res[el.name] = fval;
            // } else {
            //   res[el.name] = el.field;
            // }
            res[el.name] = el.field;
            break;
          case MULKeyValueCategory.object:
            res[el.name] = this.getObjectValue(el);
            break;
          case MULKeyValueCategory.array:
            res[el.name] = this.getArrayValue(el);
            break;
        }
      });
    }
    return res;
  }

  fieldKeys(): Array<string> {
    const keys = Object.keys(this.fieldCategory);
    return keys;
  }

  fieldVals(): Array<string> {
    const keys = Object.keys(this.fieldCategory);
    // debugLog('---', keys.map(el => keys[el]));
    return keys.map(el => Object(this.fieldCategory)[el]);
  }

  dispatchField(item: MULKeyValue, val) {
    item.category = MULKeyValueCategory.field;
    item.field = val;
  }

  // TODO: it is very slow method. It is possible to make it faster!

  dispatchArray(item: MULKeyValue, obj: any[]): void {
    // console.time('123');
    item.object = [];
    item.category = MULKeyValueCategory.array;
    let itm: MULKeyValue;
    obj.forEach(el => {
      if (el && typeof el === 'object') {
        if (el instanceof Array) {
          itm = new MULKeyValue(MULKeyValueCategory.array, null, false);
          item.object.push(itm);
          this.dispatchArray(itm, el);
        } else {
          itm = new MULKeyValue(MULKeyValueCategory.object, null, false);
          item.object.push(itm);
          this.dispatchObject(itm, el);
        }
      } else {
        itm = new MULKeyValue(MULKeyValueCategory.field, null, false);
        // if (typeof el === 'string') {
        //   if (!/^\".+\"$/.test(el)) {
        //     el = '"' + el + '"';
        //   }
        // }
        itm.field = el;
        item.object.push(itm);
      }
    });
    // console.timeEnd('123');
  }

  // TODO: it is very slow method. It is possible to make it faster!

  dispatchObject(item: MULKeyValue, obj: Object): void {
    item.object = [];
    item.category = MULKeyValueCategory.object;

    if (!obj) {
      debugLog('empty object');
      return;
    }

    let itm: MULKeyValue;

    const keys = Object.keys(obj);
    keys.forEach(key => {
      const el = Object(obj)[key];
      if (el && typeof el === 'object') {
        if (!el === null) {
          itm = new MULKeyValue(MULKeyValueCategory.field, key, false);
          itm.field = el;
          item.object.push(itm);
        } else {
          if (el instanceof Array) {
            itm = new MULKeyValue(MULKeyValueCategory.array, key, false);
            item.object.push(itm);
            this.dispatchArray(itm, el);
          } else {
            itm = new MULKeyValue(MULKeyValueCategory.object, key, false);
            item.object.push(itm);
            this.dispatchObject(itm, el);
          }
        }
      } else {
        itm = new MULKeyValue(MULKeyValueCategory.field, key, false);
        // if (typeof el === 'string') {
        //   if (!/^\".+\"$/.test(el)) {
        //     el = '"' + el + '"';
        //   }
        // }
        itm.field = el;
        item.object.push(itm);
      }
    });
  }

  constructor(private shared: SharedService,
              private auth: AuthService) {
    if (this.isArray) {
      // ARRAY BY DEFAULT IF EMPTY OBJECT
      this.mulItem = new MULKeyValue(MULKeyValueCategory.array, 'root');
    } else {
      this.mulItem = new MULKeyValue(MULKeyValueCategory.object, 'root');
    }
  }

  ngOnInit() {
    // debugLog('+', this.isArray);
    this.dispatchInitObject();

    let isAdmin = false;
    if (this.fixedStructure === null || this.fixedStructure === undefined) {
      this.user = this.auth.loadUserFromStorage(false);

      if (this.user && this.user.roles && this.user.roles instanceof Array) {
        this.user.roles.forEach(role => {
          if (role.code && role.code.indexOf('admin') >= 0) {
            isAdmin = true;
          }
        });
      }

      this.fixedStructure = !isAdmin;
      this.editJSON = isAdmin;
    }

    if (this.fixedStructure) {
      this.editJSON = false;
    }

    // debugLog('KEYVAL:', this.textTitle, isAdmin, this.fixedStructure, this.editJSON);
  }

  ngAfterViewInit() {
    // debugLog('~~~ this.editJSON', this.editJSON);
  }

  ngAfterViewChecked() {
    // this.updating = false;
    // console.log('this.updating', this.updating);
  }

  public dispatchInitObject(): void {
    // debugLog('keyval object', this._mulValue);
    if (!this._mulValue) {
      if (this.isArray) {
        // ARRAY BY DEFAULT IF EMPTY OBJECT
        this.dispatchArray(this.mulItem, []);
      } else {
        this.dispatchObject(this.mulItem, {});
      }
    } else {
      if (this._mulValue && typeof this._mulValue === 'object') {
        if (this._mulValue instanceof Array) {
          // debugLog('keyval array', this._mulValue);
          this.dispatchArray(this.mulItem, this._mulValue);
        } else {
          // debugLog('keyval object', this._mulValue);
          this.dispatchObject(this.mulItem, this._mulValue);
        }
      } else {
        // JUST FIELD
        this.dispatchField(this.mulItem, this._mulValue);
      }
    }
    // debugLog('keyval item', this.mulItem);
  }

  public dispatchVarObject(inObj: any): MULKeyValue {
    let mulItem: MULKeyValue;
    if (inObj && typeof inObj === 'object') {
      if (Array.isArray(inObj)) {
        mulItem = new MULKeyValue(MULKeyValueCategory.array);
        // console.log('keyval array', this._mulValue);
        this.dispatchArray(mulItem, inObj);
      } else {
        mulItem = new MULKeyValue(MULKeyValueCategory.object);
        // console.log('keyval object', this._mulValue);
        this.dispatchObject(mulItem, inObj);
      }
    } else {
      // JUST FIELD
      mulItem = new MULKeyValue(MULKeyValueCategory.field);
      this.dispatchField(mulItem, inObj);
    }
    // debugLog('keyval item', this.mulItem);
    return mulItem;
  }

  async addField(parent: MULKeyValue, category: MULKeyValueCategory): Promise<void> {
    const val: MULKeyValue = new MULKeyValue(category, null, true);

    if (!parent.object) {
      parent.object = [];
    }
    // parent.object.push(val);

    this.cancelEvent = false;
    // developer can change property 'val.object' to fill the field
    this.beforeAddField.emit({
      field: val,
      parent: parent,
      component: this
    });
    // component waits while handler will set the flag 'waitForEvent' to 'false'
    while (this.waitForEvent) {
      await this.shared.delay(30);
    }
    if (this.cancelEvent) {
      AlertsModule.notifyMessage('Действие отменено', alertsTypes.WARNING);
      return;
    }

    parent.object.push(val);
    // parent.object.unshift(val);
    debugLog('addField()', val);
    // console.log('filesList', this.filesList);

    this.saveValuesChanges();

    this.shared.scrollToElement('#elem-' + val.id, true, 300);
  }

  copyField(parent: MULKeyValue, item: MULKeyValue) {
    const val: MULKeyValue = item.copy();
    item.expanded = false;

    if (!parent.object) {
      parent.object = [];
    }
    parent.object.push(val);
    // parent.object.unshift(val);
    debugLog('copyField', val);

    this.saveValuesChanges();

    this.shared.scrollToElement('#elem-' + val.id, true, 300);
  }

  removeItem(parent, item) {
    if (!parent || !item) {
      return;
    }

    parent.object = parent.object.filter(el => {
      return (el.id !== item.id);
    });

    // this.changeMultiValue();
    this.saveValuesChanges();
  }

  changeMultiValue() {
    this.multiChange.emit(this._mulValue);
    // debugLog('multiChange:', this._mulValue);
    // this.multiChange.emit(this.mulValue);
  }

  getObjJSON() {
    // debugLog('this.value', this.value);
    if (this.mulItem.category === MULKeyValueCategory.array) {
      return this.shared.getObjJSON(this._mulValue, true);
    } else {
      return this.shared.getObjJSON(this._mulValue);
    }
  }

  changeJSON(e) {
    if (e.target && e.target.value) {
      const el = <HTMLTextAreaElement>e.target;
      const val = el.value;
      // debugLog('JSON', val, e);
      let obj;
      if (this.isArray) {
        obj = this.shared.getArrayFromJSON(val);
      } else {
        obj = this.shared.getObjfromJSON(val);
      }
      if (!obj) {
        el.focus();
        AlertsModule.notifyDangerMessage('Ошибка в JSON выражении');
      } else if (!this.shared.compareObjects(obj, this._mulValue)) {
        this._mulValue = obj;
        this.changeMultiValue();
        // debugLog('JSON', this._mulValue);
      } else {
        debugLog('JSON not changed');
      }
      // debugLog('JSON', e.target.value);
    }
  }

  getValueType(val) {
    return (val !== null && val !== undefined) ? typeof val : '<null>';
  }

  changeFieldValue(item, e) {
    if (!e.target || !e.target.value) {
      item.field = null;
      // this.changeMultiValue();
      this.saveValuesChanges();
      return;
    }

    const origin = e.target.value;
    const val = String(origin).trim().toLowerCase();
    // debugLog('+++', val);

    // NULL
    if (!val) {
      item.field = null;
      // this.changeMultiValue();
      this.saveValuesChanges();
      return;
    }
    // TRUE
    if (val === 'true') {
      item.field = Boolean(true);
      // this.changeMultiValue();
      // debugLog('type', typeof item.field);
      this.saveValuesChanges();
      return;
    }
    // FALSE
    if (val === 'false') {
      item.field = Boolean(false);
      // this.changeMultiValue();
      // debugLog('type', typeof item.field);
      this.saveValuesChanges();
      return;
    }
    // NUMBER
    if (/^([0-9]+([.|,][0-9]+)?)$/.test(val)) {
      if (/^([0-9]+(,[0-9]+)?)$/.test(val)) {
        // change ',' to '.'
        item.field = Number(origin.replace(/,/g, '.'));
      } else {
        item.field = Number(origin);
      }

      // this.changeMultiValue();
      // debugLog('type', typeof item.field);
      this.saveValuesChanges();
      return;
    }
    // STRING
    // if (/^\".+\"$/.test(val)) {
    //   item.field = String(origin);
    //   // this.changeMultiValue();
    //   return;
    // }
    // REST OF IT IS STRING
    item.field = String(origin);

    // item.field = null;
    // this.changeMultiValue();
    this.saveValuesChanges();
  }

  private saveValuesChanges(saveChanges = false) {
    if (saveChanges || this.autoSaveChanges) {
      const obj = this.shared.copyObject(this.mulValue);
      if (obj && typeof obj === 'object') {
        // change value only if card has changes
        if (!this.shared.compareObjects(obj, this._mulValue)) {
          this._mulValue = obj;
          this.changeMultiValue();
        }

        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  toggleEditMode(saveChanges = true) {
    if (this.editMode) {
      if (saveChanges) {
        if (this.saveValuesChanges(true)) {
          this.saveStructureClicked.emit(this.mulValue);
        } else {
          AlertsModule.notifyDangerMessage(this.labels.errorObjectStructure);
          this.modeJSONClicked.emit();
          return;
        }
      } else {
        this.modeJSONClicked.emit();
      }
      this.editMode = false;
    } else {
      this.modeStructureClicked.emit();
      this.updating = true;
      // debugLog('this.updating', this.updating);
      setTimeout(() => {
        this.dispatchInitObject();
        this.updating = false;
        this.editMode = true;
      }, 0);
    }
    // this.editMode = !this.editMode;
  }

  getObjectName(obj: MULKeyValue, isArray = true) {
    // console.time('getObjectName');
    let val;

    if (obj && obj.name) {
      // debugLog('obj.name', obj.name);
      if (isArray) {
        val = `[${obj.name}]`;
      } else {
        val = `{${obj.name}}`;
      }
    }

    if (!val && obj && obj.object && obj.object.length) {
      obj.object.forEach(el => {
        if (el.name.toLowerCase() === 'name' && typeof el.field === 'string') {
          if (isArray) {
            val = `[${el.field}]`;
          } else {
            val = `{${el.field}}`;
          }
        }
        if (el.name.toLowerCase() === 'title' && typeof el.field === 'string') {
          if (isArray) {
            val = `[${el.field}]`;
          } else {
            val = `{${el.field}}`;
          }
        }
        if (!val && el.name.toLowerCase() === 'id' && typeof el.field === 'string') {
          if (isArray) {
            val = `[${el.field}]`;
          } else {
            val = `{${el.field}}`;
          }
        }
        if (!val && el.name.toLowerCase() === 'group' && typeof el.field === 'string') {
          if (isArray) {
            val = `[${el.field}]`;
          } else {
            val = `{${el.field}}`;
          }
        }
      });
    }

    if (!val) {
      val = this.labels.array;
      if (isArray) {
        val = `[${this.labels.array}]`;
      } else {
        val = `{${this.labels.object}}`;
      }
    }

    // console.timeEnd('getObjectName');
    // debugLog(val);

    return val;
  }

  changeActiveCheckBox(parent, item) {
    if (parent && parent.object
      && item && item.name && item.name.toLowerCase().trim() === 'active') {
      const val = (item.field === true);
      // debugLog(parent, item, val);
      parent.object.forEach(el => {
        // debugLog(el.category, MULKeyValueCategory.array);
        if (el.category === MULKeyValueCategory.array) {
          // debugLog(el.name, el.object instanceof Array);
          if (el.object instanceof Array) {
            el.object.forEach(sub => {
              if (sub && sub.object instanceof Array) {
                sub.object.forEach(subel => {
                  // debugLog(subel);
                  if (subel.category === MULKeyValueCategory.field
                    && subel.name && subel.name.toLowerCase().trim() === 'active') {
                    subel.field = val;
                  }
                });
              }
            });
          }
        }
      });
    }
    this.saveValuesChanges();
  }

  canGetUp(parent: MULKeyValue, item: MULKeyValue): boolean {
    if (parent && Array.isArray(parent.object) && parent.object.length > 1) {
      let pos = -1;
      for (let i = 0; i < parent.object.length; i++) {
        if (parent.object[i].id === item.id) {
          pos = i;
          break;
        }
      }

      if (pos > 0) {
        return true;
      }
    }

    return false;
  }

  canGetDown(parent: MULKeyValue, item: MULKeyValue): boolean {
    if (parent && Array.isArray(parent.object) && parent.object.length > 1) {
      let pos = -1;
      for (let i = 0; i < parent.object.length; i++) {
        if (parent.object[i].id === item.id) {
          pos = i;
          break;
        }
      }

      if (pos < parent.object.length - 1) {
        return true;
      }
    }

    return false;
  }


  /**
   * Сдвинуть объект вверх
   *
   * @method getUpObject
   * @param {MULKeyValue} parent
   * @param {MULKeyValue} item
   */
  getUpObject(parent: MULKeyValue, item: MULKeyValue): void {
    if (parent && Array.isArray(parent.object) && parent.object.length > 1) {
      let pos = -1;
      for (let i = 0; i < parent.object.length; i++) {
        if (parent.object[i].id === item.id) {
          pos = i;
          break;
        }
      }

      if (pos > 0) {
        const tempEl = parent.object[pos - 1];
        parent.object[pos - 1] = parent.object[pos];
        parent.object[pos] = tempEl;
        this.saveValuesChanges();
      }
    }
  }

  /**
   * Сдвинуть объект вниз
   *
   * @method getDownObject
   * @param {MULKeyValue} parent
   * @param {MULKeyValue} item
   */
  getDownObject(parent: MULKeyValue, item: MULKeyValue): void {
    if (parent && Array.isArray(parent.object) && parent.object.length > 1) {
      let pos = -1;
      for (let i = 0; i < parent.object.length; i++) {
        if (parent.object[i].id === item.id) {
          pos = i;
          break;
        }
      }

      if (pos < parent.object.length - 1) {
        const tempEl = parent.object[pos + 1];
        parent.object[pos + 1] = parent.object[pos];
        parent.object[pos] = tempEl;
        this.saveValuesChanges();
      }
    }
  }
}
