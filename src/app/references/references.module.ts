import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ReferencesRoutes} from './references.routing';
import {BankPartnersComponent} from './bank-partners/bank-partners.component';
import {FooterlogModule} from '../shared/footerlog/footerlog.module';
import {MaterialModule} from '../material.module';
import {OWL_DATE_TIME_LOCALE, OwlDateTimeModule, OwlNativeDateTimeModule, OwlDateTimeIntl} from 'ng-pick-datetime';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {DataTableModule} from '../data-table';
import {DepartmentsComponent} from './departments/departments.component';
import {ContractorsComponent} from './contractors/contractors.component';
import {DefaultIntl} from '../classes/constants';
import {AddressesComponent} from './addresses/addresses.component';
import {PeopleComponent} from './people/people.component';
import {SuggestionsModule} from '../suggestions/suggestions.module';
import {MultiElementsModule} from '../multielements/multielements.module';
import {ClipboardModule} from 'ngx-clipboard';
import {PipesModule} from '../pipes/pipes.module';
import {AttentionsComponent} from './attentions/attentions.component';
import {ComponentsModule} from '../components/components.module';
import {MAT_DATE_LOCALE} from '@angular/material';
import {BrandsComponent} from './brands/brands.component';
import {ReferenceComponent} from './reference/reference.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ReferencesRoutes),
    FormsModule,
    ClipboardModule,
    MaterialModule,
    DataTableModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Angular2FontawesomeModule,
    MultiElementsModule,
    FooterlogModule,
    PipesModule,
    SuggestionsModule,
    ComponentsModule
  ],
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'ru'},
    {provide: OwlDateTimeIntl, useValue: DefaultIntl},
    {provide: MAT_DATE_LOCALE, useValue: 'ru'}
  ],
  declarations: [
    ContractorsComponent,
    DepartmentsComponent,
    BankPartnersComponent,
    AddressesComponent,
    PeopleComponent,
    AttentionsComponent,
    BrandsComponent,
    ReferenceComponent
  ]
})

export class ReferencesModule {

}
