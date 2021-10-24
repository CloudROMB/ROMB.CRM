import 'print-js'; // You can find documentation at printjs.crabbly.com
import {Injectable} from '@angular/core';
import {UUID} from 'angular2-uuid';
import {CellType, DataTableColumn, DataTableRequestParams, DataTableView, DTViewTypes} from '../classes/tables';
import {AlertsModule} from '../alerts/alerts.module';
import {AuthService} from './auth.service';
import {alertsTypes, genders} from '../classes/types';
import {DocumentStatuses, UserStatuses} from '../classes/data';
import {ActivatedRoute, Params, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from '@angular/router';
import {defaultSystemTranslation} from '../classes/translation';
import {Location} from '@angular/common';
import {CredentialsItem, MenuItem} from '../classes/routes';
import {defaultOrderStatuses, defaultPrintForms, OrderStatuses, PrintForms} from '../classes/selectobjects';
import {debugLog, errorLog} from '../app.log';

declare const $: any;

@Injectable()
export class SharedService {
  dateFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;

  version = '';
  clipboard = '';
  userSettings: any = {};

  metadata: Array<any> = [];
  metadataLastUpdate = new Date();

  mainMenu: string[] = [];
  mainMenuStructure: MenuItem[] = [];
  mainMenuLastUpdate = new Date();

  credentials: string[] = [];
  credentialsStructure: CredentialsItem[];
  credentialsLastUpdate = new Date();

  toggleButton: any;
  private sidebarVisible: boolean;

  /**
   * Sort Object by Keys
   *
   * @static
   * @method sortObject
   * @param {object} obj - object which have to sort
   * @returns {object}
   */
  static sortObject(obj: any): any {
    const ordered = {};
    Object.keys(obj).sort().forEach(function (key) {
      ordered[key] = obj[key];
    });

    return ordered;
  }

  /**
   * Get's exact position of event.
   *
   * @static
   * @method getEventPosition
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
  static getEventPosition(e) {
    let posx = 0;
    let posy = 0;

    if (!e) {
      e = window.event;
    }

    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy
    };
  }

  /**
   * Function to check if we clicked inside an element with a particular class
   * name.
   *
   * @static
   * @method clickInsideElement
   * @param {Object} e - The event
   * @param {String} className - The class name to check against
   * @return {Boolean}
   */
  static clickInsideElement(e, className) {
    let el = e.target || e.srcElement;
    if (el.classList.contains(className)) {
      return el;
    } else {
      el = el.parentNode;
      while (el) {
        if (el.classList && el.classList.contains(className)) {
          return el;
        }
        el = el.parentNode;
      }
    }
    return false;
  }

  static stopEvent(e) {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  static isObjectNotEmpty(obj) {
    if (obj && typeof obj === 'object') {
      return (Object.keys(obj).length > 0);
    } else {
      return false;
    }
  }

  static isRefObjectSelected(obj: any) {
    const isObject = this.isObjectNotEmpty(obj);
    if (!isObject) {
      return false;
    }

    if (obj.hasOwnProperty('id') && obj.id) {
      return true;
    }

    if (obj.hasOwnProperty('_id') && obj._id) {
      return true;
    }

    return false;
  }

  static getOrderStatusID(doc) {
    let status = 0;

    if (doc && typeof doc === 'object') {
      if (doc.orderStatus && doc.orderStatus.id) {
        status = doc.orderStatus.id;
      }
    }

    return status;
  }

  constructor(private auth: AuthService,
              private loc: Location,
              private route: ActivatedRoute,
              private router: Router) {
    // console.log('host name', window.location.host);
    // console.log('******** shared service');
    this.loadSettings();
  }

  metaToColumns(data) {
    const cols: DataTableColumn[] = [];

    for (const item of data.props) {
      let col: DataTableColumn;
      col = item;

      // if ()
      // col.type = item.type;

      cols.push(col);
    }

    return cols;
  }

  loadSettings() {
    const values = localStorage.getItem('setts');
    let settingRead = false;
    if (values) {
      try {
        // console.log('3');

        this.userSettings = JSON.parse(values);
        settingRead = true;

      } catch (e) {
        console.log('ERROR user settings', e.message);
      }
    }

    if (!settingRead) {
      // console.log('4');
      this.userSettings.navbar_menu_visible = 0;
      this.userSettings.active_collapse = true;
      this.userSettings.disabled_collapse_init = 0;
      this.userSettings.sidebarVisible = false;
    }

    if (this.userSettings.hasOwnProperty('sidebarVisible')) {
      this.sidebarVisible = this.userSettings.sidebarVisible;
    } else {
      this.sidebarVisible = false;
    }

    if (this.userSettings.sidebar_mini_active === true) {
      $('body').addClass('sidebar-mini');
    } else {
      $('body').removeClass('sidebar-mini');
    }

    if (!this.userSettings.uuid) {
      this.userSettings.uuid = UUID.UUID();
      this.saveSettings();
    }
  }

  saveSettings() {
    localStorage.setItem('setts', JSON.stringify(this.userSettings));
  }

  private sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);
    this.sidebarVisible = true;
    this.saveSettings();
    body.classList.add('nav-open');
  }

  private sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    this.saveSettings();
    body.classList.remove('nav-open');
  }

  sidebarOpenClose() {
    const navbar = document.getElementsByTagName('romb-navbar')[0];
    if (navbar) {
      this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    }
    if (!this.toggleButton) {
      return false;
    }

    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }

    return true;
  }

  sidebarMinMaximize() {
    if (this.userSettings.sidebar_mini_active === true) {
      $('body').removeClass('sidebar-mini');
      this.userSettings.sidebar_mini_active = false;
      this.saveSettings();
    } else {
      setTimeout((arg) => {
        $('body').addClass('sidebar-mini');
        this.userSettings.sidebar_mini_active = true;
        this.saveSettings();
      }, 300);
    }

    // // we simulate the window Resize so the charts will get updated in realtime.
    // const simulateWindowResize = setInterval(function () {
    //   window.dispatchEvent(new Event('resize'));
    // }, 180);
    //
    // // we stop the simulation of Window Resize after the animations are completed
    // setTimeout(function () {
    //   clearInterval(simulateWindowResize);
    // }, 1000);
  }

  sidebarInitialize() {
    if ($('body').hasClass('sidebar-mini')) {
      this.userSettings.sidebar_mini_active = true;
    }
    if ($('body').hasClass('hide-sidebar')) {
      this.userSettings.hide_sidebar_active = true;
    }
  }

  sidebarHide() {
    if (this.userSettings.hide_sidebar_active === true) {
      setTimeout(function () {
        $('body').removeClass('hide-sidebar');
        this.userSettings.hide_sidebar_active = false;
      }, 300);
      setTimeout(function () {
        $('.sidebar').removeClass('animation');
      }, 600);
      $('.sidebar').addClass('animation');
    } else {
      setTimeout(function () {
        $('body').addClass('hide-sidebar');
        // $('.sidebar').addClass('animation');
        this.userSettings.hide_sidebar_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function () {
      window.dispatchEvent(new Event('resize'));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function () {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  copyObject(item: any, replaceDates = false) {
    try {
      // console.log('+++ parse', JSON.parse(JSON.stringify(item)));
      const obj = JSON.parse(JSON.stringify(item));
      if (replaceDates && obj && typeof obj === 'object') {
        if (obj instanceof Array) {
          this.arrayStrToDate(obj);
        } else {
          this.objectStrToDate(obj);
        }
        if (obj.hasOwnProperty('stamp')) {
          debugLog('!!! compare', this.compareObjects(item, obj), typeof item.stamp, typeof obj.stamp);
        }
      }
      // console.log('!!! compare', this.compareObjects(item, obj), item.stamp, obj.stamp);
      return obj;
    } catch (err) {
      errorLog('ERROR copyObject():', err.message);
      return null;
    }
  }

  objectStrToDate(obj) {
    if (obj && !(obj instanceof Array)) {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'undefined' || obj[key] === null || obj[key] === '') {
        } else if (typeof obj[key] === 'string') {
          if (this.dateFormat.test(obj[key])) {
            // console.log('+++', key, obj[key], new Date(obj[key]), Date(obj[key]));
            obj[key] = new Date(obj[key]);
            // console.log('+++ OBJ', obj);
          }
        } else if (typeof obj[key] === 'object') {
          if (obj[key] instanceof Array) {
            this.arrayStrToDate(obj[key]);
          } else {
            this.objectStrToDate(obj[key]);
          }
        }
      });
    }
  }

  arrayStrToDate(arr) {
    if (arr && arr instanceof Array) {
      arr.forEach((el, i, a) => {
        if (typeof el === 'undefined' || el === null || el === '') {
        } else if (typeof el === 'string') {
          if (this.dateFormat.test(el)) {
            // console.log('+++ ARR', arr);
            a[i] = new Date(el);
            // console.log('+++ ARR', arr);
          }
        } else if (typeof el === 'object') {
          if (el instanceof Array) {
            this.arrayStrToDate(el);
          } else {
            this.objectStrToDate(el);
          }
        }
      });
    }
  }

  compareObjects(obj1, obj2) {
    try {
      return (JSON.stringify(obj1) === JSON.stringify(obj2));
    } catch (err) {
      errorLog('compareObjects():', err);
      return false;
    }
  }

  fillObject(source: any, etalon: any = null, cleanEtalon = true) {
    try {
      let obj = {};
      if (etalon && typeof etalon === 'object') {
        if (cleanEtalon) {
          obj = this.copyObject(etalon);
        } else {
          obj = etalon;
        }
      }
      if (typeof source === 'object') {
        const item = this.copyObject(source);
        Object.keys(item).forEach((key) => {
          if (typeof item[key] !== 'undefined' && item[key] !== null && item[key] !== '') {
            if (typeof item[key] === 'object') {
              if (item[key] instanceof Array) {
                // console.log('!', typeof item[key], item[key]);

                let _etalon;
                if (etalon && etalon[key] && typeof etalon[key] === 'object' && etalon[key] instanceof Array) {
                  _etalon = this.copyObject(etalon[key]);
                }
                obj[key] = this.fillArray(this.copyObject(item[key]), _etalon);

                // console.log('!+', typeof obj[key], obj[key]);
                // console.log('!+', typeof item[key], item[key]);
              } else {
                let _etalon;
                if (etalon && etalon[key] && (typeof etalon[key] === 'object' || etalon[key] instanceof Array)) {
                  _etalon = this.copyObject(etalon[key]);
                }
                obj[key] = this.fillObject(this.copyObject(item[key]), _etalon);
              }
            } else if (typeof item[key] === 'string') {
              // test for Date format
              if (this.dateFormat.test(item[key])) {
                obj[key] = new Date(item[key]);
              } else {
                obj[key] = item[key];
              }
            } else {
              obj[key] = item[key];
            }
          }
        });
      }
      // console.log('fillObject', item, obj);
      return obj;
    } catch (err) {
      console.error('ERROR fillObject:', err.message);
      return null;
    }
  }

  fillArray(source: any, etalon: any = null) {
    try {
      let obj = [];
      if (etalon && typeof etalon === 'object' && source instanceof Array) {
        obj = this.copyObject(etalon);
      }
      if (typeof source === 'object' && source instanceof Array) {
        const item = this.copyObject(source);
        item.forEach((el) => {
          if (typeof el !== 'undefined' && el !== null && el !== '') {
            if (typeof el === 'object') {
              // if (el instanceof Array) {
              //   console.log('!', el);
              // }

              obj.push(this.copyObject(el));

              // if (el instanceof Array) {
              //   console.log('!+', this.copyObject(el));
              // }
            } else if (typeof el === 'string') {
              // test for Date format
              if (this.dateFormat.test(el)) {
                obj.push(new Date(el));
              } else {
                obj.push(el);
              }
            } else {
              obj.push(el);
            }
          }
        });
      }
      // console.log('fillObject', item, obj);
      return obj;
    } catch (err) {
      console.log('ERROR fillObject:', err.message);
      return null;
    }
  }

  // ALERT QUERIES
  public queryLogOut() {
    AlertsModule.logoutAlert().then(choice => {
      if (choice === true) {
        this.auth.logout();
      }
    });
  }

  public async querySaveCard() {
    return await AlertsModule.saveAlert().then(choice => choice);
  }

  public async queryDiscardSaveCard() {
    return await AlertsModule.discardSaveAlert().then(choice => choice);
  }

  public async queryDeleteCard() {
    return await AlertsModule.deleteAlert().then(choice => choice);
  }

  // returns Object in JSON representation
  getObjJSON(obj, isArray = false): string {
    try {
      return JSON.stringify(obj, undefined, 4);
    } catch (err) {
      console.error('ERROR getObjJSON:', err.message);
      if (isArray) {
        return '{}';
      } else {
        return '[]';
      }
    }
  }

  getObjfromJSON(json) {
    try {
      return JSON.parse(json);
    } catch (err) {
      console.error('ERROR getObjfromJSON:', err.message);
      return null;
    }
  }

  getArrayFromJSON(json) {
    try {
      return JSON.parse(json);
    } catch (err) {
      console.error('ERROR getArrayFromJSON:', err.message);
      return null;
    }
  }

  // returns Object in representation to store in document filed
  getObjectToFieldStore(obj: any, source: string | null = null) {
    if (obj && typeof obj === 'object' && source && typeof source === 'string') {
      const objres: any = {
        id: obj._id,
        code: obj.code,
        name: obj.name,
        descr: obj.descr,
        source: source
      };

      if (objres.parent) {
        objres.parent = this.copyObject(objres.parent);
      }
      return objres;
    } else {
      console.log('ERROR getObjectToFieldStore:', obj, typeof obj, source, typeof source);
      return null;
    }
  }

  //
  // suggestion object representation
  //

  getGender(obj) {
    if (obj && obj.gender) {
      switch (obj.gender) {
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
  }

  getFullPeopleName(obj) {
    if (obj && obj.FIO) {
      return obj.fullName;
    } else {
      return '';
    }
  }

  getActiveTitle(item) {
    if (item && item.active) {
      return DocumentStatuses.active;
    } else {
      return DocumentStatuses.blocked;
    }
  }

  getContractorOPF(obj, short = true) {
    if (obj && obj.opf) {
      if (short) {
        return obj.opf.short;
      } else {
        return obj.opf.full;
      }
    } else {
      return '<не укзан>';
    }
  }

  copyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.appendChild(textArea);
    // textArea.innerText = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    console.log(textArea);

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      // document.body.removeChild(textArea);
      // console.log('Copying text command was ' + msg);
      // if (successful) {
      //   AlertsModule.notifyMessage(defaultSystemTranslation.copiedLinkToClipboard + text, alertsTypes.SUCCESS, 1000);
      //   return true;
      // }
      return successful;
    } catch (err) {
      AlertsModule.notifyDangerMessage(defaultSystemTranslation.errorcopyToClipboard);
      console.log('ERROR clipboard, unable to copy text', err);
    }
    return false;
  }

  copyElementValue(el) {
    try {
      el.focus();
      el.select();

      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      // document.body.removeChild(textArea);
      // console.log('Copying text command was ' + msg);
      // if (successful) {
      //   AlertsModule.notifyMessage(defaultSystemTranslation.copiedLinkToClipboard + el.value, alertsTypes.SUCCESS, 1000);
      //   return true;
      // }
      return successful;
    } catch (err) {
      AlertsModule.notifyDangerMessage(defaultSystemTranslation.errorcopyToClipboard);
      console.log('ERROR clipboard, unable to copy text', err);
    }
    return false;
  }

  addParamToCurrentRoute(route, id) {
    const tree: UrlTree = this.router.parseUrl(this.loc.path(true));
    // stay two route segments
    tree.root.children[PRIMARY_OUTLET].segments = tree.root.children[PRIMARY_OUTLET].segments.slice(0, 2);
    // create 'id' param
    const s: UrlSegment = new UrlSegment(id, {});
    // append 'id' param
    tree.root.children[PRIMARY_OUTLET].segments.push(s);
    // change route state
    this.loc.replaceState(this.router.serializeUrl(tree));
  }

  removeParamToCurrentRoute(route) {
    const tree: UrlTree = this.router.parseUrl(this.loc.path(true));
    const segments = tree.root.children[PRIMARY_OUTLET].segments;
    // console.log('***', segments);
    if (segments.length > 2) {
      // stay two route segments
      tree.root.children[PRIMARY_OUTLET].segments = segments.slice(0, 2);
      // change route state
      this.loc.replaceState(this.router.serializeUrl(tree));
    }
  }

  getCurrentRoute(link) {
    return location.protocol + '//' + document.domain + this.loc.prepareExternalUrl(this.loc.path(true));
  }

  // https://praveenlobo.com/blog/how-to-scroll-elements-smoothly-in-javascript-jquery-without-plugins/
  scrollToElement(selector: string, focusInput = true, delay = 100, smooth = true) {
    setTimeout(() => {
      const els = document.querySelectorAll(selector);
      if (els.length <= 0) {
        return;
      }
      const el = <HTMLElement>els[els.length - 1];
      // const el = <HTMLElement>document.querySelector(selector);

      if (el) {
        // console.log('+', el);
        if (smooth) {
          // el.scrollIntoView({block: 'end', behavior: 'smooth'});
          el.scrollIntoView({block: 'start', behavior: 'smooth'});
        } else {
          el.scrollIntoView(true);
        }

        if (focusInput) {
          const inp = <HTMLInputElement>document.querySelector(selector + ' input');
          if (inp) {
            setTimeout(() => {
              inp.focus();
              inp.select();
            }, 300);
          }
        }
      }
    }, delay);
  }

  scrollToEl(el: HTMLElement, focusInput = true, delay = 100, smooth = true) {
    setTimeout(() => {
      if (el) {
        // console.log('+++', el);
        if (smooth) {
          // el.scrollIntoView({block: 'end', behavior: 'smooth'});
          el.scrollIntoView({block: 'start', behavior: 'smooth'});
        } else {
          el.scrollIntoView(true);
        }

        if (focusInput) {
          const inp = el.querySelector('input');
          if (inp) {
            setTimeout(() => {
              inp.focus();
            }, 150);
          }
        }
      }
    }, delay);
  }

  /**
   * Pause for [ms] milliseconds
   *
   * @method delay
   * @param {number} ms
   * @returns {Promise<void>}
   */
  delay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkHasFiles(files) {
    let hasFiles = false;
    if (files && files instanceof Array && files.length) {
      files.forEach(cat => {
        if (typeof cat === 'object' && cat.hasOwnProperty('list')
          && cat.list instanceof Array && cat.list.length) {
          hasFiles = true;
        }
      });
    }
    return hasFiles;
  }

  updateInputs(msec?: number) {
    const period = msec || 300;

    setTimeout(() => {
      $('.card-content input').change();
      $('.card-content textarea').change();
      $('.dt-card-form input').change();
      $('.dt-card-form textarea').change();

      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.dt-card-form input');
        if (el) {
          // console.log('focused:', el);
          el.focus();
        }
      }, 50);
    }, period);
  }

  checkCredential(cred: string) {
    const user = this.auth.user;
    if (user && user.roles && user.roles instanceof Array) {
      let superuser = false;
      user.roles.some(role => {
        if (role.code === 'admin') {
          superuser = true;
          return true;
        }
      });
      if (superuser) {
        // console.log('CHECK creds: SUPERUSER');
        return true;
      }
    }

    let res = false;
    if (this.credentials && this.credentials instanceof Array) {
      res = (this.credentials.filter(item => (item === cred)).length > 0);
    }

    // console.log('checkCredential', cred, res);
    return res;
  }

  checkCredentials(creds: string[]) {
    const user = this.auth.user;
    if (user && user.roles && user.roles instanceof Array) {
      let superuser = false;
      user.roles.some(role => {
        if (role.code === 'admin') {
          superuser = true;
          return true;
        }
      });
      if (superuser) {
        // debugLog('CHECK creds: SUPERUSER');
        return creds;
      }
    }

    if (this.credentials && this.credentials instanceof Array) {
      const rules = [];
      this.credentials.forEach(cred => {
        creds.forEach(test => {
          if (test === cred) {
            rules.push(cred);
          }
        });
      });

      // console.log('CHECK creds:', (rules.length > 0));
      if (!(rules && rules.length > 0)) {
        debugLog('The user have no credentials for this operation');
      }
      return rules;
    } else {
      debugLog('The user have no any credentials');
      // console.log('CHECK creds: false');
      return [];
    }
  }

  getPrintFormByID(formID: string) {
    let form: PrintForms = null;
    defaultPrintForms.forEach(el => {
      if (el.id === formID) {
        form = el;
      }
    });
    if (!form) {
      form = null;
    }
    return form;
  }

  getOrderStatusByID(statusID) {
    let status: OrderStatuses = null;
    defaultOrderStatuses.forEach(el => {
      if (el.id === statusID) {
        status = el;
      }
    });
    if (!status) {
      status = defaultOrderStatuses[0];
    }
    return status;
  }

  // lift up order status to id, if current status not more
  liftUpOrderStatus(doc, statusID) {
    let status = this.getOrderStatusByID(statusID) || null;
    if (doc && typeof doc === 'object' && status) {
      if (doc.orderStatus && doc.orderStatus.id) {
        if (doc.orderStatus.id < statusID) {
          doc.orderStatus = status;
        } else {
          status = doc.orderStatus;
        }
      } else {
        doc.orderStatus = status;
      }
    }
    // console.log('liftUpOrderStatus:', status);
    return status;
  }

  printTab(contentID: string): void {
    // console.log($(contentID), $(contentID).html());
    // const printContents = document.getElementById(contentID).innerHTML;
    // console.log('PRINT:', contentID, printContents);
    // if (printContents) {
    //   let popupWin;
    //   popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    //   // popupWin = window.open('', '_self', 'top=0,left=0,height=100%,width=auto');
    //   popupWin.document.open();
    //   popupWin.document.write(`
    //     <html>
    //       <head>
    //         <title>Print tab</title>
    //         <style>
    //         </style>
    //       </head>
    //     <body
    //       style="width: 100%; display: flex; align-items: center; justify-content: space-around;"
    //       onload="window.print();window.close()">${printContents}</body>
    //     </html>
    //   `);
    //   popupWin.document.close();
    // } else {
    //   console.log('PRINT ERROR: there is no content with ID:', contentID);
    // }
  }
}
