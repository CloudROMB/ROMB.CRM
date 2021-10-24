import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {DataTableComponent} from './components/table';
import {DataTableRowComponent} from './components/row';
import {DataTablePaginationComponent} from './components/pagination';
import {DataTableHeaderComponent} from './components/header';

import {PixelConverter} from './utils/px';
import {MinPipe} from './utils/min';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {PipesModule} from '../pipes/pipes.module';
import {MenusModule} from '../menus/menus.module';
import {AlertsModule} from '../alerts/alerts.module';
import {CutcellPipe} from '../pipes/cutcell.pipe';
// import {MultiElementsModule} from '../multielements/multielements.module';
import {ClipboardModule} from 'ngx-clipboard';
import {MaterialModule} from '../material.module';
import {DataTableLiteComponent} from './components/tablelite';
import {SharedService} from '../services/shared.service';
import {AuthService} from '../services/auth.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    Angular2FontawesomeModule,
    // MultiElementsModule,
    AlertsModule,
    MenusModule,
    MaterialModule,
    PipesModule
  ],
  declarations: [
    DataTableLiteComponent,
    DataTableComponent,
    DataTableRowComponent,
    DataTablePaginationComponent,
    DataTableHeaderComponent,
    PixelConverter,
    MinPipe
  ],
  exports: [
    DataTableComponent,
    DataTableLiteComponent
  ],
  providers: [
    CutcellPipe
  ]
})
export class DataTableModule {
}
