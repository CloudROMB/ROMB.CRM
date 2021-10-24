import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';

declare const $: any;

@Component({
  selector: 'romb-foxexpress',
  templateUrl: './foxexpress.component.html',
  styleUrls: ['./foxexpress.component.scss']
})
export class FoxexpressComponent implements OnInit {
  _form;
  _sender;
  _reciever;
  _delivery;
  _cargo;

  _cityClass;
  _citySelClass;
  _addressClass;

  _lastValue;
  _inputTimer;
  _lastInput;

  constructor() {
  }

  ngOnInit() {
    this._sender = {
      company: document.getElementById('senderCompany'),
      person: document.getElementById('senderPerson'),
      country: document.getElementById('senderCountry'),
      city: document.getElementById('senderCity'),
      citySel: document.getElementById('senderCitySelect'),
      index: document.getElementById('senderIndex'),
      address: document.getElementById('senderAddress'),
      tel: document.getElementById('senderPhone'),
      email: document.getElementById('senderEmail'),
      comment: document.getElementById('senderComment')
    };
    this._reciever = {
      company: document.getElementById('recCompany'),
      person: document.getElementById('recPerson'),
      country: document.getElementById('recCountry'),
      city: document.getElementById('recCity'),
      citySel: document.getElementById('recCitySelect'),
      index: document.getElementById('recIndex'),
      address: document.getElementById('recAddress'),
      tel: document.getElementById('recPhone'),
      email: document.getElementById('recEmail'),
      comment: document.getElementById('recComment')
    };
    this._delivery = {
      date: document.getElementById('deliveryDate'),
      timeFrom: document.getElementById('deliveryTimeFrom'),
      timeTill: document.getElementById('deliveryTimeTill'),
      tarif: document.getElementById('deliveryTarif'),
      payer: document.getElementById('deliveryPayer'),
      payKind: document.getElementById('deliveryPayKind')
    };
    this._cargo = {
      kind: document.getElementById('cargoKind'),
      number: document.getElementById('cargoNumber'), // число мест
      weight: document.getElementById('cargoWeight'),
      volume: document.getElementById('cargoVolume'),
      length: document.getElementById('cargoLength'),
      width: document.getElementById('cargoWidth'),
      height: document.getElementById('cargoHeight'),
      description: document.getElementById('cargoDescription')
    };

    this._cityClass = $('.form-param-city');
    this._citySelClass = $('.form-select-city');
    this._addressClass = $('.form-param-address');

    this._lastValue = '';
    this._inputTimer = 500;
    this._lastInput = Date.now();

    // TO DO перенести в Material
    // инициализация тултипов
    // $('[data-toggle="tooltip"]').tooltip();
    //
    // // инициализация календарика
    // $.extend($.fn.datepicker.defaults, {
    //   format: 'dd.mm.yyyy',
    //   language: 'ru',
    //   autoclose: true
    // });
    // $('.datepicker').datepicker();

    // устанавливаем текущую дату
    const today = new Date();
    let dd: string = String(today.getDate()),
      mm = String(today.getMonth() + 1); // January is 0!
    const yyyy = String(today.getFullYear());
    if (today.getDate() < 10) {
      dd = '0' + dd;
    }
    if (today.getMonth() < 9) {
      mm = '0' + mm;
    }
    this._delivery.date.value = dd + '.' + mm + '.' + yyyy;

    // фокус на первую строчку
    this._sender.company.focus();

    if (!('fetch' in window)) {
      console.log('Fetch API not found, try including the polyfill');
      $('.old-browser').attr('hidden', 'false');
      $('#sendOrder').attr('hidden', 'true');
      return;
    }

    // входим в поле Город
    this._cityClass.focus((e) => {
      $('.alert').attr('hidden', 'true');
      if (e.currentTarget.value.trim().length < 2) {
        return;
      }
      ;
      if (this._lastValue.trim() === e.currentTarget.value.trim()) {
        return;
      }
      ;

      const taddr = '', tindex = '';
      let tcitySel;
      if (e.target.id === 'senderCity') {
        tcitySel = this._sender.citySel;
      } else {
        tcitySel = this._reciever.citySel;
      }

      const param = encodeURIComponent(e.target.value.trim()).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
      this.getCity(tcitySel, param);
    });

    // покидаем поле Город
    this._cityClass.blur((e) => {
      const taddr = (e.target.id === 'senderCity') ? this._sender.address : this._reciever.address;
      const tindex = (e.target.id === 'senderCity') ? this._sender.index : this._reciever.index;
      if (e.target.value.trim() && $(e.target).attr('data')) { // открываем адрес для ввода
        taddr.removeAttribute('disabled');
      } else { // закрываем адрес, очищаем зависимые поля
        taddr.setAttribute('disabled', 'disabled');
        $(e.target).attr('data', '');
        tindex.value = '';
        taddr.value = '';
        $(taddr).attr('data', '');
      }
      this._lastValue = e.currentTarget.value.trim();
    });
    // ввод города
    this._cityClass.on('input', (e) => {
      if (e.currentTarget.value.trim().length < 2) {
        return;
      }

      if (this._lastValue.trim() === e.currentTarget.value.trim()) {
        return;
      } else {
        this._lastValue = e.currentTarget.value.trim();
      }

      this._lastInput = Date.now();

      let taddr, tindex, tcitySel;
      if (e.target.id === 'senderCity') {
        taddr = this._sender.address;
        tindex = this._sender.index;
        tcitySel = this._sender.citySel;
      } else {
        taddr = this._reciever.address;
        tindex = this._reciever.index;
        tcitySel = this._reciever.citySel;
      }

      // очищаем поля адреса и индекса
      tindex.value = '';
      taddr.value = '';
      $(taddr).attr('data', '');
      taddr.setAttribute('disabled', 'disabled');

      const param = encodeURIComponent(e.target.value.trim()).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
      });

      setTimeout(() => {
        const now = Date.now();
        if (now >= this._lastInput + this._inputTimer) {
          this.getCity(tcitySel, param);
        }
        ;
      }, this._inputTimer);
    });

    this._addressClass.focus((e) => {
      $('.alert').attr('hidden', 'true');
    });
    this._addressClass.blur((e) => {
      if (e.target.value.trim().length < 2) {
        return;
      }

      let city, addr, indx, succ, err;
      if (e.target.id === 'senderAddress') {
        city = this._sender.city;
        addr = this._sender.address;
        indx = this._sender.index;
        succ = $('#senderAddressSuccess');
        err = $('#senderAddressError');
      } else {
        city = this._reciever.city;
        addr = this._reciever.address;
        indx = this._reciever.index;
        succ = $('#recAddressSuccess');
        err = $('#recAddressError');
      }

      // escape функция
      const param = encodeURIComponent(('Россия, ' + city.value + ', ' + addr.value).trim()).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
      // console.log(param);

      fetch('/foxexpress/searchAddress.php?addr=' + param, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'same-origin'
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          if (!data.hasOwnProperty('result')) {
            console.log(data);
            return;
          } else if (!data.result) {
            console.log(data.message);
            return;
          }

          if (data.kind === 'house') {
            if (data.precision === 'exact') {
              succ.attr('hidden', false);
              // SetUserIndex(param, indx, addr);
              this.SetUserIndex({addr: param, selectorIndex: indx});
            } else {
              this.SetUserIndex({addr: data.text, selectorIndex: indx});
              err.html('Дом не найден. Ближайший: ' + data.text);
              err.attr('hidden', false);
            }
          }
          if (data.kind === 'street') {
            err.html('Не указан дом');
            err.attr('hidden', false);
          }
          if ((data.kind !== 'street') && (data.kind !== 'house')) {
            err.html('Улица не найдена');
            err.attr('hidden', false);
          }
          if (data.text.indexOf('улица Москва') > -1) {
            err.html('Улица не найдена');
            err.attr('hidden', false);
          }
        })
        .catch((err1) => {
          console.log(err1.message);
          err1.html('Ошибка при поиске улицы');
          err1.attr('hidden', false);
        });
    });

    // Получаем индексы по адресам
    function SetUserIndex(addr, selectorIndex, selectorAddress) {
      const api = 'AIzaSyDwxbcw3blLzEZtj0qwx5TwY1GXSQzhfX0';
      const url = 'https://maps.googleapis.com/maps/api/geocode/json?key' + api + '&address=';
      $.getJSON(url + addr, function (data) {
        // console.log(data);
        if (data.results[0]) {
          // console.log(data.results[0]);
          const len = data.results[0].address_components.length;
          if (len > 0) {
            selectorIndex.value = data.results[0].address_components[len - 1].long_name;
            if (selectorAddress) {
              selectorAddress.value = data.results[0].formatted_address;
            }
          }
        }
      });
    }

    this._citySelClass.on('blur', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      $(e.currentTarget).hide();
    });
    this._citySelClass.on('select', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.selectCity(e.currentTarget);
    });
    this._citySelClass.on('change', (e) => {
      // console.log('change: ' + e.currentTarget.selectedIndex);
    });
    this._citySelClass.on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('click: ' + e.currentTarget.selectedIndex);
      this.selectCity(e.currentTarget);
    });
    this._citySelClass.on('keypress keyup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // console.log(e.keyCode + ' - ' + e.key);
      if (e.keyCode === 13) {
        // console.log('select');
        this.selectCity(e.currentTarget);
      } else if (e.keyCode === 27 || e.keyCode === 9) {
        // window.citySelClass.hide();
        if (e.currentTarget.id === 'senderCitySelect') {
          this._sender.city.focus();
        } else {
          this._reciever.city.focus();
        }
      }
    });
  }

  onSubmit(f: NgForm) {
    // проверка корректности времени отправки
    if (this._delivery.timeFrom.value >= this._delivery.timeTill.value) {
      $(this._delivery.timeFrom).focus();
      return;
    }

    $('form').classList.add('was-validated');
    if ($('form').checkValidity() === false) { // если не все поля заполнены, возвращаемся к заполнению формы
      $('.form-control:invalid').focus();
      return;
    }

    const reqObj = {
      sender: {
        company: this._sender.company.value,
        person: this._sender.person.value,
        country: this._sender.country.value,
        city: $(this._sender.city).attr('data'),
        cityName: this._sender.city.value,
        index: this._sender.index.value,
        address: this._sender.address.value,
        tel: this._sender.tel.value,
        email: this._sender.email.value,
        comment: this._sender.comment.value
      },
      receiver: {
        company: this._reciever.company.value,
        person: this._reciever.person.value,
        country: this._reciever.country.value,
        city: $(this._reciever.city).attr('data'),
        cityName: this._reciever.city.value,
        index: this._reciever.index.value,
        address: this._reciever.address.value,
        tel: this._reciever.tel.value,
        email: this._reciever.email.value,
        comment: this._reciever.comment.value
      },
      delivery: {
        takeDate: this._delivery.date.value,
        takeTime: this.getTakeTime(),
        urgencyName: this._delivery.tarif.value,
        urgency: this._delivery.tarif.options[this._delivery.tarif.selectedIndex].value,
        payer: this._delivery.payer.options[this._delivery.payer.selectedIndex].value,
        payKind: this._delivery.payKind.options[this._delivery.payKind.selectedIndex].value
      },
      cargo: {
        kind: this._cargo.kind.options[this._cargo.kind.selectedIndex].value,
        weight: this._cargo.weight.value,
        volume: this._cargo.volume.value,
        length: this._cargo.length.value,
        width: this._cargo.width.value,
        height: this._cargo.height.value,
        description: this._cargo.description.value,
        number: this._cargo.number.value
      }
    };
    // console.log(JSON.stringify(reqObj));

    $('form').attr('hidden', 'true');
    $('.wait').attr('hidden', 'false');
    fetch('/foxexpress/curierOrder.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-type': 'application/json'
      },
      mode: 'same-origin',
      body: JSON.stringify(reqObj)
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log(data);
        $('.wait').attr('hidden', 'true');
        if (data.result === true) {
          $('#order-number').html(data.data);
          $('.result-OK').attr('hidden', 'false');
        } else {
          $('.result-message').html('Причина: ' + data.message);
          $('.result-error').attr('hidden', 'false');
        }
      })
      .catch(err => {
        console.log(err.message);
      });
  }

  selectCity(t) {
    if (t.id === 'senderCitySelect') {
      this._sender.city.value = t.options[t.selectedIndex].innerHTML;
      // this._sender.city.value = $(t.options[t.selectedIndex]).attr('data');
      $(this._sender.city).attr('data', t.options[t.selectedIndex].value);
      this._sender.address.removeAttribute('disabled');
      this._sender.address.focus();
    } else {
      this._reciever.city.value = t.options[t.selectedIndex].innerHTML;
      // window.reciever.city.value = $(t.options[t.selectedIndex]).attr('data');
      $(this._reciever.city).attr('data', t.options[t.selectedIndex].value);
      this._reciever.address.removeAttribute('disabled');
      this._reciever.address.focus();
    }
    $(t).hide();
  }

  getTakeTime() {
    return 'С ' + this._delivery.timeFrom.options[this._delivery.timeFrom.selectedIndex].text + ' до ' +
      this._delivery.timeTill.options[this._delivery.timeTill.selectedIndex].text;
  }

  getCity(selector, cityName) {
    fetch('/foxexpress/searchCity.php?name=' + cityName,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'same-origin'
        // mode: 'cors'
      })
      .then((res) => {
        // console.log(res);
        return res.json();
      })
      .then((data) => {
        if (!data.hasOwnProperty('data')) {
          return;
        }
        ;

        if (data.data.length <= 0) {
          return;
        }
        ;

        const tag = $(selector);
        tag.html('');
        let cityName_ = '';
        if (!data.result) {
          console.log(data.message);
        } else {
          if (data.data && data.data.items && Array.isArray(data.data.items)) {
            for (let i = 0; i < data.data.items.length; i++) {
              cityName_ = data.data.items[i].cityName;
              cityName_ += (data.data.items[i].areaName) ? ', ' + data.data.items[i].areaName : '';

              tag.append('<option value="' +
                data.data.items[i].city + '" data="' +
                data.data.items[i].cityName + '">' +
                cityName_ + '</option>');
            }
          }
          tag.show();
          tag.find('option')[0].setAttribute('selected', 'selected');
          selector.focus();
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  // Получаем индексы по адресам
  SetUserIndex(params: any) {
    if (!params || !params.addr || !params.selectorIndex) {
      return;
    }
    const api = 'AIzaSyDwxbcw3blLzEZtj0qwx5TwY1GXSQzhfX0';
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?key' + api + '&address=';
    $.getJSON(url + params.addr, function (data) {
      // console.log(data);
      if (data.results[0]) {
        // console.log(data.results[0]);
        const len = data.results[0].address_components.length;
        if (len > 0) {
          params.selectorIndex.value = data.results[0].address_components[len - 1].long_name;
          if (params.selectorAddress) {
            params.selectorAddress.value = data.results[0].formatted_address;
          }
        }
      }
    });
  }
}
