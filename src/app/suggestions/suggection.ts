import {
  AfterViewInit,
  Directive,
  ElementRef, EventEmitter, HostListener, Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import {APIconfig} from '../../environments/config';
import {SuggestionTypes} from '../classes/types';
import {SharedService} from '../services/shared.service';

declare const $: any;

@Directive({
    selector: '[daData]'
  }
)
export class SuggectionDirective implements OnInit, AfterViewInit, OnDestroy {
  @Output() daSelect = new EventEmitter();
  @Input() suggType: SuggestionTypes;
  @Input() suggCount = 5;
  @Input() val: any;

  listenFunc: Function;
  private element;
  data: any;
  data1: any;

  @HostListener('focus', ['$event']) onFocus(event) {
    // if (this.element) {
    //   console.log('HIDE SUGG:', this.element);
    //   this.element.hide();
    // }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  constructor(private shared: SharedService,
              private ref: ElementRef,
              private renderer: Renderer2) {
    // this.createCustomEvent();
  }

  // CustomEvent(event, params) {
  //   params = params || {bubbles: false, cancelable: false, detail: undefined};
  //   const evt = document.createEvent('CustomEvent');
  //   evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  //   return evt;
  // }
  //
  // createCustomEvent() {
  //   if (<any>window.CustomEvent && typeof <any>window.CustomEvent === 'function') {
  //     return false;
  //   }
  //
  //   this.CustomEvent().prototype = window.Event.prototype;
  //
  //   window.CustomEvent = this.CustomEvent();
  // }

  ngOnInit() {
    // console.log('------------');
  }

  ngAfterViewInit() {
    // console.log('SUGG ngAfterViewInit', this.val);
    const input = <HTMLInputElement>this.ref.nativeElement;
    if (input) {
      const label = <HTMLElement>input.parentElement.querySelector('.control-label');
      if (label) {
        label.innerText = label.innerText + ' (подсказка)';
      } else {
        if (input.hasAttribute('placeholder')) {
          const holder = input.getAttribute('placeholder');
          input.setAttribute('placeholder', holder + ' (подсказка)');
        } else {
          input.setAttribute('placeholder', this.suggType + ' (подсказка)');
        }
      }
    }

    // console.log('++++++++++++++');
    if (!(this.listenFunc && typeof this.listenFunc === 'function')) {
      // подписались на событие получения адреса
      // this.listenFunc = this.renderer.listen(this.ref.nativeElement, 'dadata', (event) => {
      //   if (!(event.detail && typeof event.detail === 'object')) {
      //     console.log('ERROR suggestion data', event);
      //     return false;
      //   } else {
      //     this.data = this.shared.copyObject(event.detail);
      //     this.val = this.shared.fillObject(this.data, this.val, false);
      //
      //     // console.log('SUGG:', this.val, this.data);
      //     this.daSelect.emit(this.data);
      //     return true;
      //   }
      // });

      // подписались на событие получения адреса
      this.listenFunc = this.renderer.listen(this.ref.nativeElement, 'dadata', (event) => {
        try {
          if (event.target.title) {
            const obj = JSON.parse(event.target.title);
            this.data = this.shared.copyObject(obj);
            this.val = this.shared.fillObject(this.data, this.val, false);

            console.log('SUGG:', this.val);
            this.daSelect.emit(this.data);
            return true;
          }
        } catch (err) {
          console.error('Ошибка обработки данных подсказки:', event, err);
          return false;
        }
      });

      // назначили элементу #address вывод подсказки ввода адресов
      this.element = $(this.ref.nativeElement).suggestions({
        token: APIconfig.DaData.apikey,
        type: this.suggType,
        count: this.suggCount,
        /* Вызывается, когда пользователь выбирает одну из подсказок */
        onSelect: this.getSuggestion,
        onSearchError: this.errorSuggestion
      }).suggestions();
    }
    // console.log('INIT:', this.addr, this.listenFunc);
    // console.log('///', this.data);
  }

  private errorSuggestion(err) {
    console.error('+++ DaData:', err);
  }

  private getSuggestion(suggestion) {
    try {
      if (!(suggestion && typeof suggestion.data === 'object')) {
        console.log('ERROR suggestion:', suggestion);
        throw new Error('ERROR suggestion:');
      }
      // const event = new Event('data');
      // event.data = suggestion.data;

      // console.log('daData', suggestion);
      const data = suggestion.data;

      data.selected = suggestion.value;
      data.unrestricted = suggestion.unrestricted_value;
      data.value = suggestion.unrestricted_value || suggestion.value;
      if (data.stamp) {
        // console.log('data.stamp', data.stamp);
        data.update = data.stamp;
      }
      delete data.stamp;
      delete data.qc;
      delete data.source;
      // delete data.name;
      // delete data.code;
      delete data._id;
      // console.log('data.update', data.update);

      const ob = <HTMLInputElement>(<any>this);
      ob.title = JSON.stringify(data);
      // console.log('*** data', ob.title);

      // <HTMLInputElement>this.data
      // document.body.data = data;

      // console.log('------', this.ref.nativeElement);
      // const event = new CustomEvent('dadata', {detail: data});

      // console.log(1);
      // const event = new Event('dadata');

      // $(this.ref.nativeElement)[0].dispatchEvent(event);
      // console.log(2);
      // (<any>this).dispatchEvent(event, {bubbles: true});
      // ob.dispatchEvent(event, {bubbles: true});

      // console.log(3);

      const customEvent = document.createEvent('HTMLEvents');
      customEvent.initEvent('dadata', true, true);
      // document.dispatchEvent(customEvent);
      ob.dispatchEvent(customEvent);
    } catch (err) {
      console.error('??? DaData:', err);
    }
  }

  ngOnDestroy() {
    // remove listener
    this.listenFunc();
  }
}
