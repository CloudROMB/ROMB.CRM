import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {bankAccountDocument} from '../../classes/datamodels';
import {MULBankAccount, SuggestionTypes} from '../../classes/types';
import {AlertsModule} from '../../alerts/alerts.module';
import {UUID} from 'angular2-uuid';

declare const $: any;


@Component({
  selector: 'romb-bank-accounts',
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss']
})
export class BankAccountsComponent implements OnInit {

  public bankAccountItemStructure: any = bankAccountDocument;
  suggType = SuggestionTypes;
  @Input() accountsList: MULBankAccount[];

  constructor(
    private shared: SharedService
  ) {
  }

  ngOnInit() {
  }

  /**
   * Добавить новый набор банковских реквизитов
   * @param {Object} item
   */
  onAddBankAccount(): void {
    this.accountsList.push({
      id: UUID.UUID(),
      bank_name: '',
      bank: {
        name: {
          payment: ''
        },
        correspondent_account: '',
        bic: ''
      },
      settlement_account: '',
      active: true
    });
  }

  /**
   * Удалить набор банковских реквизитов
   * @param item
   * @param index
   */
  async onDeleteBankAccount(index) {
    const choice = await AlertsModule.deleteAlert('Удалить банковские реквизиты?');
    if (choice === true) {
      this.accountsList.splice(index, 1);
    }
  }

  /**
   * Выбор банка в реквизитах
   * @param obj
   * @param item
   */
  onSelectBank(obj, item) {
    item.bank = this.shared.fillObject(obj, this.bankAccountItemStructure.bank);
    item.bank_name = item.bank.value;
  }

  /**
   * Переключение сheckbox
   * @param item
   */
  onToggleActive(item) {
    item.active = !item.active;
  }
}
