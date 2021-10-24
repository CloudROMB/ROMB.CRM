import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {JournalComponent} from './journal.component';
import {RouterModule} from '@angular/router';
import {JournalRoutes} from './journal.routing';
import {FormsModule} from '@angular/forms';
import {FooterlogModule} from '../shared/footerlog/footerlog.module';
import {MaterialModule} from '../material.module';
import {DataTableModule} from '../data-table';
import {PipesModule} from '../pipes/pipes.module';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {MAT_DATE_LOCALE} from '@angular/material';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {SuggestionsModule} from '../suggestions/suggestions.module';
import {MultiElementsModule} from '../multielements/multielements.module';
import {ComponentsModule} from '../components/components.module';
import {TextMaskModule} from 'angular2-text-mask';
import {PrintFormsComponent} from '../print-forms/print-forms.component';
import {CURRENCY_MASK_CONFIG} from 'ng2-currency-mask/src/currency-mask.config';
import {CustomCurrencyMaskConfig} from '../app.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(JournalRoutes),
    FormsModule,
    MaterialModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FooterlogModule,
    DataTableModule,
    Angular2FontawesomeModule,
    SuggestionsModule,
    MultiElementsModule,
    PipesModule,
    ComponentsModule,
    TextMaskModule
  ],
  declarations: [
    JournalComponent,
    PrintFormsComponent
  ],
  providers: [
    DatePipe,
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'}
  ]
})
export class JournalModule {
}
