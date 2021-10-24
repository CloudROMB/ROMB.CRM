import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RefSelectComponent} from './refselect/refselect.component';
import {RefListComponent} from './reflist/reflist.component';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {DataTableModule} from '../data-table';
import {ComboListComponent} from './combo-list/combo-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DataTableModule,
    MaterialModule,
    Angular2FontawesomeModule
    // MultiElementsModule
  ],
  declarations: [
    RefSelectComponent,
    RefListComponent,
    ComboListComponent
  ],
  exports: [
    RefSelectComponent,
    RefListComponent,
    ComboListComponent
  ]
})
export class ComponentsModule {
}
