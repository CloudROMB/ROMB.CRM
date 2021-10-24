import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ApiResponse, AuthResponse} from '../classes/responses';
import {AlertsModule} from '../alerts/alerts.module';
import {alertsTypes, RequestMethods} from '../classes/types';
import {Router} from '@angular/router';
import {SharedService} from './shared.service';
import {DataTableRequestParams} from '../classes/tables';
import {MenuItem} from '../classes/routes';
import {environment} from '../../environments/environment';
import {debugLog, errorLog} from '../app.log';

declare const $: any;

@Injectable()
export class ApiService {
  private domain = environment.API_host;
  private gettingAllMeta = false;
  private gettingMenu = false;
  private gettingCreds = false;

  public events: any[] = [
    {
      type: 'message',
      message: 'Нераспределенная заявка',
      link: '#'
    },
    {
      type: 'message',
      message: 'Пришли документы от ИП Валенков И.И.',
      link: '#'
    },
    {
      type: 'message',
      message: 'Остался 1 час до завершения вашей задачи',
      link: '#'
    }
  ];

  constructor(private auth: AuthService,
              private shared: SharedService,
              private router: Router,
              private http: HttpClient) {
  }

  /**
   * запросы к API
   * @method postRequest
   * @param method {string} - path to REST API, like '/route/method'
   * @param data {object|null} - on a server side is the req.body property
   * @param {Object} params
   *  @property {boolean|null} disableAuthCheck - параметры вызова HTTP запроса
   *  @property {RequestMethods} requestMethod
   */
  async postRequest(method: string, data?: any, params?: any): Promise<ApiResponse> {
    try {
      if (!params) {
        params = {};
      }
      if (!params.disableAuthCheck) {
        params.disableAuthCheck = false;
      }
      if (!params.disableAuthCheck && !this.auth.loggedIn(!params.disableAuthCheck)) {
        // Отключен выброс пользователя, если он не залогинен
        // this.auth.logout();

        return <ApiResponse>{
          result: false,
          message: 'user is not logged in'
        };
      }

      // const options = {
      //   // withCredentials: true,
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // };

      let request;
      if (params && params.requestMethod === RequestMethods.DELETE) {
        request = this.http.delete<any>(<string>(this.domain + method), {
          // withCredentials: true,
          headers: new HttpHeaders({'Content-Type': 'application/json'}),
          observe: 'response'
        });
      } else if (params && params.requestMethod === RequestMethods.PUT) {
        request = this.http.put<any>(<string>(this.domain + method), <any>data, {
          // withCredentials: true,
          headers: new HttpHeaders({'Content-Type': 'application/json'}),
          observe: 'response'
        });
      } else {
        request = this.http.post<any>(<string>(this.domain + method), <any>data, {
          // withCredentials: true,
          headers: new HttpHeaders({'Content-Type': 'application/json'}),
          observe: 'response'
        });
      }

      // const obs = <Observable<HttpResponse<Object>>>this.http.post(<string>(this.domain + method), <any>data,
      // const answer = await <Promise<ApiResponse>>this.http.post<any>(<string>(this.domain + method), <any>data, {
      //   // withCredentials: true,
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   }),
      //   observe: 'response'
      // })
      const answer = await <Promise<ApiResponse>>request
        .toPromise()
        .then(res => {
          return res.body;
        })
        .catch(err => {
          throw err;
        });
      if (!answer) {
        throw new Error('There is no API answer');
      }
      debugLog('POST', method, answer);

      if (answer.result !== true) {
        if (answer.status === 403) {
          AlertsModule.notifyDangerMessage('Пользователю запрещен доступ к системе');
          setTimeout(() => {
            debugLog('~~~ postRequest(): 403', answer.message);
            this.auth.logout();
          }, 250);
          return {
            result: false,
            message: answer.message
          };
        } else {
          AlertsModule.notifyDangerMessage('Не удалось получить ответ от сервера!');
          return {
            result: false,
            message: 'Ошибка сервера: ' + answer.message
          };
        }
      }
      return answer;
    } catch (err) {
      errorLog('postRequest():', err);
      return <ApiResponse>{
        result: false,
        message: err.message,
        status: err.status
      };
    }
  }

  async postFormRequest(method: string, data?: any, disableAuthCheck: boolean = false): Promise<ApiResponse> {
    if (!disableAuthCheck) {
      disableAuthCheck = false;
    }
    if (!disableAuthCheck && !this.auth.loggedIn(!disableAuthCheck)) {
      // Отключен выброс пользователя, если он не залогинен
      // this.auth.logout();

      return <ApiResponse>{
        result: false,
        message: 'user is not logged in'
      };
    }

    const options = {
      // withCredentials: true,
      headers: new HttpHeaders({
        // 'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      })
    };
    // const options = {
    //   // withCredentials: true,
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   })
    // };

    const answer = await <Promise<ApiResponse>>this.http.post(this.domain + method, data, options)
      .toPromise();

    if (!answer) {
      AlertsModule.notifyDangerMessage('Не удалось получить ответ от сервера!');
      return {
        result: false,
        message: 'Не удалось получить ответ от сервера!'
      };
    }

    return answer;
    // .then(answer => <ApiResponse>answer)
    // .catch((error: any) => {
    //   return <ApiResponse>{
    //     result: false,
    //     message: error.message,
    //     status: error.status
    //   };
    // });
  }

  async getRequest(method: string, disableAuthCheck: boolean = false): Promise<ApiResponse> {
    if (!disableAuthCheck) {
      disableAuthCheck = false;
    }
    if (!disableAuthCheck && !this.auth.loggedIn(!disableAuthCheck)) {
      errorLog('User is not logged!');

      // Отключен выброс пользователя, если он не залогинен
      // this.auth.logout();

      return <ApiResponse>{
        result: false,
        message: 'user is not logged in'
      };
    }

    const options = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': window.location.host,
        'Access-Control-Allow-Credentials': 'true'
      })
    };

    // console.log('http.get:', this.domain + method, options);
    return await <Promise<ApiResponse>>this.http.get(this.domain + method, options)
      .toPromise()
      .then(answer => <ApiResponse>answer)
      .catch((error: any) => {
        return <ApiResponse>{
          result: false,
          message: error.message,
          status: error.status
        };
      });
  }

  getNewEvents() {
    return new Observable<object>(observer => {
        observer.next(this.events);
        observer.complete();
      }
    );
  }

// Function to get user's profile data
  getProfile() {
    return this.postRequest('/users/info', {});
  }

  getCustomers(page) {
    return this.postRequest('/customers/list', {page: page});
  }

  getSystemTypes(params) {
    return this.postRequest('/system/types/list', params);
  }

  getMails(params) {
    return this.postRequest('/mail/list', params);
  }

  getDocs(params) {
    return this.postRequest('/api/docslist', params);
  }

  // GET REFERENCE META INFO
  /**
   * @async
   * @method getAllMeta
   */
  async getAllMeta() {
    if (this.gettingAllMeta) {
      let counter = 0;
      let gotIt = false;
      while (counter < 25 && !gotIt) {
        // console.log('waiting metadata...');
        await this.shared.delay(100);
        gotIt = !this.gettingAllMeta;
        counter++;
      }
      return this.gettingAllMeta;
    }

    if (!this.auth.loggedIn(false)) {
      return {
        result: false,
        message: 'user not logged in'
      };
    }

    this.gettingAllMeta = true;
    const res = await this.postRequest('/api/meta');
    if (res && res.result) {
      this.shared.metadata = res.data;
      this.shared.metadataLastUpdate = new Date();
      debugLog('META:', this.shared.metadata);
    } else {
      console.log('ERROR GETTING metadata:', res.message);
      AlertsModule.notifyDangerMessage('ERROR GETTING metadata');
    }
    this.gettingAllMeta = false;
    return res;
  }

  async getMeta(source): Promise<ApiResponse> {
    if (!this.shared.metadata.length || new Date().getTime() - this.shared.metadataLastUpdate.getTime() > 60000) {
      await this.getAllMeta();
    }

    if (this.shared.metadata && this.shared.metadata.length) {
      const arr = this.shared.metadata
        .filter(el => {
          return (el.code === source);
        });

      if (arr.length) {
        return {
          result: true,
          data: arr[0]
        };
      } else {
        return {
          result: false,
          message: 'there is no such metadata'
        };
      }
    } else {
      return {
        result: false,
        message: 'there is no metadata'
      };
    }
  }

  // GET main menu
  async getMainMenuStructure(params): Promise<MenuItem[]> {
    await this.getMainMenu(params);
    return this.shared.mainMenuStructure;
  }

  async getMainMenu(params) {
    // if (!(!this.shared.mainMenu.length || new Date().getTime() - this.shared.mainMenuLastUpdate.getTime() > 60000)) {
    //   return this.shared.mainMenu;
    // }

    if (this.gettingMenu) {
      let counter = 0;
      let gotIt = false;
      while (counter < 5 && !gotIt) {
        console.log('waiting main menu...');
        await this.shared.delay(500);
        gotIt = !this.gettingMenu;
        counter++;
      }
      return this.shared.mainMenu;
    }

    this.gettingMenu = true;
    const menureq = await this.postRequest('/api/menu/get', params || {});
    if (menureq && menureq.result && menureq.data && menureq.data.menu && menureq.data.menu instanceof Array) {
      debugLog('MENU:', menureq.data, params);
      this.shared.mainMenu = menureq.data.menu;
      this.shared.mainMenuStructure = menureq.data.structure;
      this.shared.mainMenuLastUpdate = new Date();
    } else {
      this.shared.mainMenu = [];
      this.shared.mainMenuStructure = [];
      errorLog('getMainMenu(): ', menureq);
      AlertsModule.notifyDangerMessage(`Не удалось получить меню`);
    }
    this.gettingMenu = false;
    return this.shared.mainMenu;
  }

  // GET Credentials
  async getRoleCredentials(roleId: string) {
    const credreq = await this.postRequest('/api/credentials/get', {
      id: roleId
    });
    if (credreq && credreq.result && credreq.data) {
      return {
        credentials: credreq.data.credentials,
        structure: credreq.data.structure
      };
    } else {
      console.log('ERROR getRoleCredentials', credreq);
      AlertsModule.notifyDangerMessage(`Не удалось получить мандаты роли`);
      return {
        credentials: [],
        structure: []
      };
    }
  }

  async getUserCredentialsStructure() {
    const cred = await this.getCredentials();
    // console.log('getCredentialsStructure', cred, this.shared.credentialsStructure);
    return this.shared.credentialsStructure;
  }

  async getCredentials() {
    if (!(!this.shared.credentials.length || new Date().getTime() - this.shared.credentialsLastUpdate.getTime() > 60000)) {
      return this.shared.credentials;
    }

    if (this.gettingCreds) {
      let counter = 0;
      let gotIt = false;
      while (counter < 5 && !gotIt) {
        // console.log('waiting credentials...');
        await this.shared.delay(500);
        gotIt = !this.gettingCreds;
        counter++;
      }
      return this.shared.credentials;
    }

    this.gettingCreds = true;
    const credreq = await this.postRequest('/api/credentials/get', {});
    if (credreq && credreq.result && credreq.data && credreq.data.credentials && credreq.data.credentials instanceof Array) {
      debugLog('CREDENTIALS:', credreq);
      this.shared.credentials = credreq.data.credentials;
      this.shared.credentialsStructure = credreq.data.structure;
      this.shared.credentialsLastUpdate = new Date();
      // console.log('--- CREDS:', this.shared.credentialsStructure);
    } else {
      this.shared.credentials = [];
      this.shared.credentialsStructure = [];
      console.log('ERROR getCredentials ', credreq);
      AlertsModule.notifyDangerMessage(`Не удалось получить мандаты`);
    }
    this.gettingCreds = false;
    return this.shared.credentials;
  }

  // TABLE LISTS
  getList(source, params: any, criteria?: any): Promise<ApiResponse> {
    return this.postRequest('/api/list', {
      collection: source,
      params: params,
      criteria: criteria
    });
  }

  /**
   * GET TABLE LISTS
   *
   * @method getRefList
   * @param source
   * @param params
   * @throws {HttpError}
   * @returns {HttpResponse}
   *   @property {boolean} result=true
   *   @property {Object} data
   *     @property {Array} list - items
   *     @property {number} length - collection length
   */
  async getRefList(source: string, params: DataTableRequestParams) {
    const res = await this.postRequest('/api/reflist', {
      collection: source,
      params: params
    });
    if (res.result) {
      // console.log('GOT refList:', res.data);
      res.data.code = source;
      return res;
    } else {
      return res;
    }
  }

  // get reference records count by some criteria in 'params' parameter
  // like this:
  // params = {
  //   criteria: {
  //     'partner.id': doc._id
  //   }
  // }
  async getRefCount(source: string, params: DataTableRequestParams) {
    const res = await this.postRequest('/api/refcount', {
      collection: source,
      params: params
    });
    if (res.result) {
      res.code = source;
      return res;
    } else {
      return res;
    }
  }

  async getDocumentById(source, id): Promise<ApiResponse> {
    return await this.postRequest('/api/document/get', {
      collection: source,
      id: id
    });
  }

  getDocumentByCode(source, code) {
    return this.postRequest('/api/document/get', {
      collection: source,
      code: code
    });
  }

  getDocumentByName(source, name) {
    return this.postRequest('/api/document/get', {
      collection: source,
      name: name
    });
  }

  deleteDocument(source, id, undelete ?) {
    return this.postRequest('/api/document/delete', {
      collection: source,
      id: id,
      undelete: undelete === true
    });
  }

  addDocument(source, doc) {
    console.log('add doc:', source, doc);
    return this.postRequest('/api/document/add', {
      collection: source,
      data: doc
    });
  }

  /**
   * Updates existing document (replaces existing document's properties)
   * [doc] have to contain the not null property [_id]
   *
   * @method putDocument
   * @param {string} source - collection code (from Metadata)
   * @param {Object} doc - document's body
   * @returns {Promise<ApiResponse>}
   */
  putDocument(source: string, doc: any): Promise<ApiResponse> {
    return this.postRequest('/api/document/put', {
      collection: source,
      data: doc
    });
  }

  /**
   * Updates specified properties of existing document
   * [fields] have to contain the not null property [_id]
   *
   * @method updateDocument
   * @param {string} source - collection code (from Metadata)
   * @param {Object} fields - document's properties whose have to be updated
   * @returns {Promise<ApiResponse>}
   */
  updateDocument(source: string, fields: any): Promise<ApiResponse> {
    return this.postRequest('/api/document/update', {
      collection: source,
      data: fields
    });
  }

  duplicateDocument(source: string, doc: any): Promise<ApiResponse> {
    return this.postRequest('/api/document/duplicate', {
      collection: source,
      data: doc
    });
  }

// TO-DOs
  getToDos(params) {
    return this.postRequest('/api/todolist', params);
  }

  addToDo(doc) {
    return this.postRequest('/api/addtodo', doc);
  }

  putToDo(doc) {
    return this.postRequest('/api/puttodo', doc);
  }

  async deleteToDo(id) {
    return await this.postRequest('/api/deltodo', id);
  }

  async getVersion() {
    if (this.shared.version) {
      return this.shared.version;
    }

    const answer: ApiResponse = await this.getRequest('/ext/ver?' + Math.random(), true);
    // console.log('getVersion:', answer);
    if (answer && answer.result && answer.data) {
      this.shared.version = answer.data.value || '';
    } else {
      this.shared.version = 'unknown';
    }
    return this.shared.version;
  }

  login(user) {
    // console.log('LOGIN:', user);
    return this.postRequest('/users/login', user, {disableAuthCheck: true})
      .then(data => {
        const res = <AuthResponse>data;
        // console.log('AuthResponse:', res);

        if (res.result) {
          // console.log('AuthResponse:', res.token, res.user);
          this.auth.storeUserData(res.token, res.user);

          this.getAllMeta().then();

          setTimeout(() => {
            // TODO: разбирать referal URL и переходить по нему
            this.router.navigateByUrl('/' + this.auth.getDashboardRoute())
              .then(suc => {
                debugLog('~~~ Navigated to dashboard', suc);
              });

            // this.router.navigate(['journal']);

            // window.location.href = '/#/dashboard';
          }, 500);
        } else {
          errorLog('login()', data);
          AlertsModule.notifyDangerMessage('<b>Ошибка входа:</b> ' + res.message);
        }
        return res;
      })
      .catch(err => {
        errorLog('login()', err);
        AlertsModule.notifyDangerMessage(err.message);
        return err;
      });
  }

  register(user) {
    return this.postRequest('/users/register', user, {disableAuthCheck: true})
      .then(data => {
        const res = <AuthResponse>data;

        // console.log('AuthResponse:', res);

        if (res.result) {
          AlertsModule.notifyMessage('Пользователь ' + user.name + ' успешно зарегистрирован. Дождитесь активации вашего логина.',
            alertsTypes.SUCCESS,
            5000);
        } else {
          // console.log(data);
          AlertsModule.notifyDangerMessage('Неудачная попытка: ' + res.message);
        }

        return res;
      })
      .catch(err => {
        AlertsModule.notifyDangerMessage(err.message);
        return null;
      });
  }

  async getUser() {
    const userreq = await this.postRequest('/users/info');

    if (!(userreq && userreq.result)) {
      AlertsModule.notifyDangerMessage('Не удалось получить информацию о пользователе');

      // Отключен выброс пользователя, если он не залогинен
      // this.auth.logout();
      return null;
    } else {
      return userreq.data;
    }
  }

  uploadFiles(filesToUpload: File[]) {
    // const body = new HttpParams();
    // for (let i = 0; i < filesToUpload.length; i++) {
    //   body.append('fileField' + String(i), filesToUpload[i]);
    // }
    // console.log('UPLOAD', body);
    // return this.postFormRequest('/api/uploadfiles', body);

    // .set('username', username)
    // .set('password', password);

    const formData: FormData = new FormData();
    for (let i = 0; i < filesToUpload.length; i++) {
      formData.append('fileField' + String(i), filesToUpload[i], filesToUpload[i].name);
    }
    // console.log('UPLOAD:', formData);
    return this.postFormRequest('/api/uploadfiles', formData);
  }

  /**
   * ***** ROLES *****
   */

  /**
   * GET ROLES LIST
   *
   * @method
   * @name getRoles
   * @param {object} params
   *   @property {string} [credential] - test the certain credential id
   *   @property {boolean} [cutFields=true] - don't cut document's fields for recieving full role objects
   */
  getRoles(params: any): Promise<ApiResponse> {
    return this.postRequest('/api/roles/get', params);
  }


  /**
   * ***** LOG JOURNAL *****
   */

  /**
   * @method getLogList - get working log for an platform object or for dates period
   * @param {Object} params
   *   @property {string} [objectID] - get log only for document _id of some collection
   *   @property {string[]} [period] - pair of datetime in UTC string format
   * @param {Object} criteria - object of mongoDB request conditions
   * @throws {Promise<ApiResponse>}
   *   @property {boolean} result=false
   *   @property {string} message - error message
   *   @property {number} status - error code
   * @returns {Promise<ApiResponse>}
   *   @property {boolean} result=true
   *   @property {Object} data
   *     @property {Object[]} data.list - array of log records ("log" collection's documents)
   *     @property {number} data.count - number of all records by criteria
   *     @property {number} data.page - one based current page of dataset
   *     @property {number} data.pages - number of pages in the dataset
   */
  getLogList(params: any, criteria?: any): Promise<ApiResponse> {
    return this.postRequest('/log/list', {
      params: params,
      criteria: criteria
    });
  }

  /**
   * @method addLogRecord - add log event to the working log
   * @param {Object} params
   *   @property {string} logEventType - string of log event type for filter records in getLogList() method
   *   @property {string} [objectID] - _id of platform object's entity (some collection's document)
   *   @property {string} [description] - optional string of log event description
   *   @property {Object} [data] - optional string of log event description
   * @throws {Promise<ApiResponse>}
   *   @property {boolean} result=false
   *   @property {string} message - error message
   *   @property {number} status - error code
   * @returns {Promise<ApiResponse>}
   *   @property {boolean} result=true
   *   @property {Object} data - object of log event record ("log" collection's document)
   *   @property {number} count - number of records in the data set
   */
  addLogRecord(params: any): Promise<ApiResponse> {
    return this.postRequest('/log/add', params);
  }

  /**
   * @method deleteLogRecord - set mark "deleted=true|false" into log event record ("log" collection's document)
   * @param {Object} params
   *   @property {string} id - _id of existing log event record ("log" collection's document)
   *   @property {boolean} [undelete] - use to set explicit value undeleted(true) or deleted(false)
   * @throws {Promise<ApiResponse>}
   *   @property {boolean} result=false
   *   @property {string} message - error message
   *   @property {number} status - error code
   * @returns {Promise<ApiResponse>}
   *   @property {boolean} result=true
   *   @property {Object} data=null
   */
  deleteLogRecord(params: any): Promise<ApiResponse> {
    return this.postRequest('/log/delete', {
      params: params
    });
  }
}
