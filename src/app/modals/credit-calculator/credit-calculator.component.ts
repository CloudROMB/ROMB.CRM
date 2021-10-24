import {Component, OnInit, Output, ViewChild, AfterViewInit, EventEmitter} from '@angular/core';
import {ModalComponent} from '../modal/modal.component';
import {AlertsModule} from '../../alerts/alerts.module';
import {debugLog} from '../../app.log';
import {createNumberMask} from 'text-mask-addons';

@Component({
  selector: 'romb-credit-calculator',
  templateUrl: './credit-calculator.component.html',
  styleUrls: ['./credit-calculator.component.scss']
})
export class CreditCalculatorComponent implements OnInit, AfterViewInit {

  zIndex = 1034;
  calculateData: any = {};
  modalRootEnabled = true;
  public currencyMask = createNumberMask({
    prefix: '',
    suffics: '',
    thousandsSeparatorSymbol: ' '
  });
  @ViewChild(ModalComponent) modalRoot: ModalComponent;
  @Output() close = new EventEmitter;

  constructor() {
  }

  ngOnInit() {
    this.calculateData = {
      creditAmount: '',
      annualRate: '',
      years: 0,
      months: 0,
      result: {
        monthlyPayment: 0,
        paymentsNum: 0,
        actualCost: 0,
        overPayment: 0
      }
    };
    debugLog('init calculator');
  }

  ngAfterViewInit() {
    this.modalRoot.show();
  }


  onCloseModal() {
    this.close.emit();
  }

  disableModalRoot() {
    this.modalRootEnabled = false;
  }

  // onCreditAmountInput(event) {
  //   console.log(event);
  //   const inputVal = event.target.value;
  //   if (event.data && /\s|[^0-9]/g.test(event.data)) {
  //     event.target.value = inputVal.slice(0, -1);
  //     return;
  //   } else {
  //     const value = inputVal.replace(/\s/g, '');
  //     const newValue = value.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
  //     this.calculateData.creditAmount = newValue;
  //     console.log(newValue, this.calculateData);
  //   }
  // }

  onAnnualRateChange(event) {
    const commaIndex = event.indexOf(',');
    if (commaIndex >= 0) {
      const result = event.replace(/,/g, '.');
      this.calculateData.annualRate = result;

    }
  }

  async calculate() {
    const valid = await this.validate();
    if (valid) {
      console.log(this.calculateData);
      const creditAmount = this.calculateData.creditAmount.replace(/\s/g, '');
      const annualRate = this.calculateData.annualRate / 1200;
      const time = (this.calculateData.years * 12) + this.calculateData.months;
      const monthlyPayment = await creditAmount * (annualRate * Math.pow(1 + annualRate, time)) / (Math.pow(1 + annualRate, time) - 1);
      if (monthlyPayment) {
        this.calculateData.result.monthlyPayment = monthlyPayment;
        this.calculateData.result.paymentsNum = time;
        this.calculateData.result.actualCost = monthlyPayment * time;
        this.calculateData.result.overPayment = (monthlyPayment * time) - creditAmount;
      }
    }
  }

  validate() {
    const item = this.calculateData;
    const time = item ? item.years + item.months : 0;
    if (!(item && item.creditAmount) || item.creditAmount.length === 0) {
      AlertsModule.notifyDangerMessage('Не указана сумма кредита');
      return false;
    }
    if (!(item && item.annualRate) || item.annualRate.length === 0) {
      AlertsModule.notifyDangerMessage('Не указана процентная ставка');
      return false;
    }
    if (time === 0) {
      AlertsModule.notifyDangerMessage('Не указан срок кредита');
      return false;
    }
    return true;
  }
}
