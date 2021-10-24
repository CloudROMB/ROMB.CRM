import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FoxexpressComponent} from './foxexpress/foxexpress.component';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CurrierRoutes} from './currier.routing';
import {MaterialModule} from '../material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CurrierRoutes),
    FormsModule,
    MaterialModule
  ],
  declarations: [
    FoxexpressComponent
  ]
})
export class CurrierModule {
}
