import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NavbarComponent} from './navbar.component';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {ModalsModule} from '../../modals/modals.module';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    Angular2FontawesomeModule,
    ModalsModule
  ],
  declarations: [
    NavbarComponent
  ],
  exports: [
    NavbarComponent
  ]
})

export class NavbarModule {
}
