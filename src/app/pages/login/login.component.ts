import {Component, ElementRef, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {debugLog, errorLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private sidebarVisible: boolean;
  private nativeElement: Node;

  user = {
    login: '',
    password: ''
  };

  constructor(private element: ElementRef,
              private auth: AuthService,
              private router: Router,
              private api: ApiService) {
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    // if (this.auth.loggedIn(false)) {
    //   debugLog('~~~', 'Navigate to dashboard');
    //   this.router.navigate([this.auth.getDashboardRoute()])
    //     .then(res => {
    //       debugLog('Navigated:', res);
    //     })
    //     .catch(err => {
    //       errorLog('Navigation error:', err);
    //     });
    //
    //   // router.navigate(['dashboard']);
    //   // router.navigate(['journal']);
    //   // window.location.href = '/';
    // }

    setTimeout(function () {
      // after 1000 ms we add the class animated to the login/register card
      $('.card').removeClass('card-hidden');

      setTimeout(() => {
        $('form input').eq(0).focus();
      }, 250);
    }, 500);
  }

  onSubmit(f: NgForm) {
    if (this.user.login && this.user.password) {
      this.api.login(this.user).then(data => {
        debugLog('login():', data);
      });

      // .then(data => {
      //   const res = <AuthResponse>data;
      //   // console.log('AuthResponse:', res);
      //
      //   if (res.result) {
      //     this.auth.storeUserData(res.token, res.user);
      //     setTimeout(() => {
      //       window.location.href = '/#/dashboard';
      //     }, 500);
      //   } else {
      //     // console.log(data);
      //     this.alerts.notifyDangerMessage('<b>Пароль неверный.</b> Попробуйте еще...');
      //     // this.notifyDanger('<b>Пароль неверный.</b> Попробуйте еще...');
      //     // this.notifyDanger(res.message);
      //   }
      // })
      // .catch(err => {
      //   this.notifyDanger(err.message);
      // });

      // subscribe(data => {
      //     const res = <AuthResponse>data;
      //     // console.log('AuthResponse:', res);
      //
      //     if (res.result) {
      //       this.auth.storeUserData(res.token, res.user);
      //       setTimeout(() => {
      //         window.location.href = '/#/dashboard';
      //       }, 500);
      //     } else {
      //       // console.log(data);
      //       this.notifyDanger('<b>Пароль неверный.</b> Попробуйте еще...');
      //       // this.notifyDanger(res.message);
      //     }
      //   },
      //   err => {
      //     this.notifyDanger(err.message);
      //   },
      //   () => {
      //
      //   });
    } else {
      AlertsModule.notifyDangerMessage('Введите имя пользователя и пароль');
      // const type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];
      // const color = Math.floor((Math.random() * 6) + 1);
    }
  }
}
