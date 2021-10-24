import {Component, NgModule, OnInit} from '@angular/core';
import {AlertsModule} from '../../alerts/alerts.module';
import {NgForm} from '@angular/forms';
import {alertsTypes} from '../../classes/types';
import {ApiService} from '../../services/api.service';

declare const $: any;

@Component({
  selector: 'romb-register-cmp',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  user = {
    name: '',
    login: '',
    email: '',
    password: ''
  };

  constructor(private api: ApiService) {

  }

  ngOnInit() {
    setTimeout(function () {
      // after 1000 ms we add the class animated to the login/register card
      $('.card').removeClass('card-hidden');
    }, 500);
    setTimeout(() => {
      $('form input').eq(0).focus();
    }, 300);
  }

  onSubmit(registerForm: NgForm) {
    if (this.user.login && this.user.login && this.user.password && this.user.email) {
      // console.log('email:', /.+@.+\..+/.test(this.user.email));
      if (!/.+@.+\..+/.test(this.user.email)) {
        AlertsModule.notifyMessage('Поле е-mail заполнено не корректно', alertsTypes.WARNING);
        return false;
      }

      this.api.register(this.user)
        .then(answer => {
          if (!answer.result) {
            $('#login').focus();
          }
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
      AlertsModule.notifyMessage('Заполните все поля', alertsTypes.WARNING);
    }
  }
}
