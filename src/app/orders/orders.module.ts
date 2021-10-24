import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {MultiElementsModule} from '../multielements/multielements.module';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {SuggestionsModule} from '../suggestions/suggestions.module';
import {ComponentsModule} from '../components/components.module';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {TextMaskModule} from 'angular2-text-mask';
import {CCOrderComponent} from './ccorder/ccorder.component';
import {BankorderComponent} from './bankorder/bankorder.component';
import {AuthLayoutComponent} from '../layouts/auth/auth-layout.component';
import {DataTableModule} from '../data-table';

export const OrdersRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'cc-order',
        component: CCOrderComponent
      },
      {
        path: 'banks',
        component: BankorderComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(OrdersRoutes),
    FormsModule,
    MaterialModule,
    Angular2FontawesomeModule,
    MultiElementsModule,
    SuggestionsModule,
    ComponentsModule,
    CurrencyMaskModule,
    TextMaskModule,
    DataTableModule,
  ],
  declarations: [
    CCOrderComponent,
    BankorderComponent
  ]
})
export class OrdersModule {
}
