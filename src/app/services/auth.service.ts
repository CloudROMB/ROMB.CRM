import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import {tokenNotExpired} from 'angular2-jwt';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {alertsTypes, User} from '../classes/types';
import {AlertsModule} from '../alerts/alerts.module';
import {ApiResponse} from '../classes/responses';
import {ApiService} from './api.service';
import {debugLog, errorLog} from '../app.log';

@Injectable()
export class AuthService {
  public authToken;
  public user;
  private waitingLogout = false;

  constructor(private location: Location,
              private router: Router) {
    this.location = location;
    // console.log('AUTH 1', location);
    // console.log('******** auth service');
  }

  // registerUser(user: Object): Observable<any> {
  //   this.createAuthenticationHeaders();
  //
  //   return this.http.post(this.domain + '/users/register', JSON.stringify(user), this.options)
  //     .map(res => {
  //       // console.log(res);
  //       // return res.json();
  //       return res;
  //     });
  // }

  // checkUser(user: Object): Observable<any> {
  //   return this.http.post(this.domain + '/users/register', user)
  //   // .map(res => res.json());
  //     .map(res => res);
  // }


  /**
   * Makes logout from system
   *
   * @method logout
   */
  logout() {
    this.authToken = null; // Set token to null
    this.user = null; // Set user to null

    if (this.waitingLogout) {
      return;
    }
    this.waitingLogout = true;

    // localStorage.clear(); // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    debugLog('logout(): Get out of CRM');
    AlertsModule.notifyMessage('Пользователь не авторизован. Готовится выход из системы', alertsTypes.INFO);
    setTimeout(() => {
      this.waitingLogout = false;

      this.router.navigate(['']).then()
        .then(res => {
          debugLog('~~~ Navigated to the root', res);
        });
    }, 3000);
  }

  loadTokenFromStorage(logout = true): string | null {
    const token: string = localStorage.getItem('token');
    if (token && token.length > 0) {
      // console.log('token', token);
      this.authToken = token;
      return token;
    } else {
      // Отключен выброс пользователя, если он не залогинен
      // if (logout) {
      //   setTimeout(() => {
      //     AlertsModule.notifyDangerMessage('Не удалось получить информацию об авторизации');
      //     this.logout();
      //   }, 250);
      // }
      this.authToken = null;
      return null;
    }
  }

  loadUserFromStorage(logout = true): any {
    const user = localStorage.getItem('user');
    if (user) {
      // console.log('token', token);
      try {
        this.user = JSON.parse(user);
        return this.user;
      } catch (err) {
        console.error('loadUserFromStorage:', err.message);
      }
    }
    AlertsModule.notifyDangerMessage('Не удалось получить информацию о пользователе');

    // Отключен выброс пользователя, если он не залогинен
    // if (logout) {
    //   this.logout();
    // }
    this.user = null;
    return null;
  }

  storeUserData(token, user) {
    // console.log('USER:', user);
    this.user = user;
    this.authToken = token;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  storeToken(token) {
    // console.log('Token:', token);
    this.authToken = token;
    localStorage.setItem('token', token);
  }

  // Function to get user's profile data
  // getProfile() {
  //   if (!this.loggedIn()) {
  //     this.logout();
  //     return;
  //   }
  //
  //   this.createAuthenticationHeaders(); // Create headers before sending to API
  //   // console.log('options:', this.options);
  //   return this.http.post(this.domain + '/users/info', {}, this.options)
  //     .catch((error: any) => {
  //       return new Observable<AuthResponse>(observer => {
  //         observer.next(
  //           {
  //             result: false,
  //             message: error.message,
  //             status: error.status
  //           });
  //         observer.complete();
  //       });
  //     });
  // }

  // Function to check if user is logged in
  loggedIn(logout = true): boolean {
    try {
      // debugLog('TOKEN loggedIn():', this.loadTokenFromStorage(false));
      return tokenNotExpired(null, this.loadTokenFromStorage(logout));
    } catch (err) {
      errorLog('loggedIn():', err);
      AlertsModule.notifyDangerMessage('Не удалось получить информацию об авторизации');

      // Отключен выброс пользователя, если он не залогинен
      // if (logout) {
      //   setTimeout(() => {
      //     this.logout();
      //   }, 250);
      // }

      return false;
    }
  }

  getDashboardRoute() {
    let droute = 'dashboard';
    if (this.user && this.user.roles && this.user.roles.length) {
      this.user.roles.forEach(role => {
        if (role && role.code) {
          if (role.code.toLowerCase().indexOf('partner') >= 0) {
            droute = 'dashboardp';
          }
        }
      });
    }
    return droute;
  }
}
