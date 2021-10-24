import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {defaultBanksLabels, MULBank, MULFinanceProduct, SuggestionTypes} from '../../classes/types';
import {UUID} from 'angular2-uuid';

declare const $: any;

@Component({
  selector: 'romb-mel-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['../multielements.scss']
})
export class BanksComponent implements OnInit {
  labels = defaultBanksLabels;
  suggType = SuggestionTypes;

  @Input() editMode = false;
  @Input() banks: MULBank[];
  @Output() multiChange = new EventEmitter();

  constructor(private api: ApiService) {
    // console.log('editMode', this.editMode);
  }

  ngOnInit() {
  }

  addBank() {
    if (!this.banks) {
      this.banks = [];
    }
    this.banks.push({
      id: UUID.UUID(),
      name: '',
      descr: '',
      active: true,
      products: []
    });

    // console.log('filesList', this.filesList);
    this.multiChange.emit(this.banks);
  }

  removeBank(bank) {
    this.banks = this.banks.filter(el => {
      return (bank.id !== el.id);
    });
    this.multiChange.emit(this.banks);
  }

  addProduct(bank) {
    if (!bank.products) {
      bank.products = [];
    }
    bank.products.push(<MULFinanceProduct>{
      id: UUID.UUID(),
      name: '',
      descr: '',
      active: true
    });
    this.multiChange.emit(this.banks);
  }

  removeProduct(bank, product) {
    bank.products = bank.products.filter(el => {
      return (product.id !== el.id);
    });
    this.multiChange.emit(this.banks);
  }

  changeMultiValue() {
    this.multiChange.emit(this.banks);
  }
}
