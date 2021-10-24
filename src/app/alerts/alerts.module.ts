import {Injectable, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import swal from 'sweetalert2';
import {alertsTypes} from '../classes/types';

// declare const swal: any;
declare const $: any;

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class AlertsModule {
  public static deleteAlert(msg: string = 'Удалить запись?') {
    return swal({
      title: msg,
      text: '',
      type: 'question',
      animation: false,
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonClass: 'btn btn-danger',
      cancelButtonClass: 'btn btn-success',
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Ничего не удалять',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x.hasOwnProperty('value') && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static changeStatusAlert(msg = 'Изменить статус заявки?', txt = '') {
    return swal({
      title: msg,
      text: txt,
      type: 'question',
      animation: true,
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Да, изменить',
      cancelButtonText: 'Отмена',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x.hasOwnProperty('value') && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static saveAlert(msg = 'Сохранить документ?') {
    return swal({
      title: msg,
      text: '',
      type: 'question',
      animation: false,
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Да',
      cancelButtonText: 'Нет',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x.hasOwnProperty('value') && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static saveChangesAlert(msg = 'В документе есть изменения, сохранить их?') {
    return swal({
      title: msg,
      text: '',
      type: 'question',
      animation: false,
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Да, сохранить',
      cancelButtonText: 'Нет, не сохранять',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x.hasOwnProperty('value') && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static discardSaveAlert() {
    return swal({
      title: 'Сохранить изменения?',
      text: '',
      type: 'question',
      target: 'body',
      animation: false,
      allowEnterKey: true,
      allowEscapeKey: true,
      showCancelButton: true,
      focusConfirm: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'ДА, сохранить и закрыть',
      cancelButtonText: 'НЕТ, закрыть карточку',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static discardRefreshAlert() {
    return swal({
      title: 'Сохранить изменения?',
      text: '',
      type: 'question',
      target: 'body',
      animation: false,
      allowEnterKey: true,
      allowEscapeKey: true,
      showCancelButton: true,
      focusConfirm: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'ДА, сохранить',
      cancelButtonText: 'НЕТ, обновить',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return true;
      });
  }

  public static closeDataCard() {
    return swal({
      title: 'Продолжить редактировать карточку?',
      text: '',
      type: 'question',
      target: 'body',
      animation: false,
      allowEnterKey: true,
      allowEscapeKey: true,
      showCancelButton: true,
      focusConfirm: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'ДА',
      cancelButtonText: 'НЕТ, закрыть',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static notifyDangerMessage(msg) {
    console.log('DANGER:', msg);
    $.notify({
      icon: 'notifications',
      message: msg
    }, {
      type: 'danger',
      timer: 3000,
      z_index: 2000,
      placement: {
        from: 'bottom',
        align: 'right'
      }
    });
  }

  public static logoutAlert() {
    return swal({
      title: 'Выйти из CRM?',
      text: 'сменить пользователя CRM',
      type: 'question',
      animation: false,
      allowEnterKey: true,
      showCancelButton: true,
      focusConfirm: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Да, выйти',
      cancelButtonText: 'Продолжить работу',
      buttonsStyling: false
    })
      .then((x) => {
        // console.log('SWAL:', x);
        return (x.hasOwnProperty('value') && x.value === true);
      })
      .catch((err) => {
        console.log('ERROR SWAL:', err);
        // swal.noop;
        return false;
      });
  }

  public static notifyMessage(msg, type?: alertsTypes, time?: number) {
    $.notify({
      icon: 'notifications',
      message: msg
    }, {
      type: (type) ? type : alertsTypes.DANGER,
      timer: (time) ? time : 1000,
      z_index: 2000,
      placement: {
        from: 'bottom',
        align: 'right'
      }
    });
  }

  constructor() {
  };
}
