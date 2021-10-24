import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmployeesComponent} from './employees/employees.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {SuggestionsModule} from '../suggestions/suggestions.module';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {DocumentsComponent} from './documents/documents.component';
import {FilesComponent} from './files/files.component';
import {PipesModule} from '../pipes/pipes.module';
import {ComponentsModule} from '../components/components.module';
import {BanksComponent} from './banks/banks.component';
import {FreshfilesComponent} from './freshfiles/freshfiles.component';
import {KeyValueComponent} from './keyvaluearray/keyvaluearray.component';
import {BankAccountsComponent} from './bank-accounts/bank-accounts.component';
import {BlockingComponent} from './blocking/blocking.component';
import {ModalsModule} from '../modals/modals.module';
import { ImagePreviewScrollComponent } from './image-preview-scroll/image-preview-scroll.component';
import { FilesControlComponent } from './files-control/files-control.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SuggestionsModule,
    PipesModule,
    Angular2FontawesomeModule,
    ComponentsModule,
    ModalsModule
  ],
  declarations: [
    EmployeesComponent,
    DocumentsComponent,
    FilesComponent,
    BanksComponent,
    FreshfilesComponent,
    KeyValueComponent,
    BankAccountsComponent,
    BlockingComponent,
    ImagePreviewScrollComponent,
    FilesControlComponent
  ],
  exports: [
    EmployeesComponent,
    DocumentsComponent,
    FreshfilesComponent,
    FilesComponent,
    BanksComponent,
    KeyValueComponent,
    BankAccountsComponent,
    BlockingComponent,
    ImagePreviewScrollComponent,
    FilesControlComponent
  ]
})
export class MultiElementsModule {
}
