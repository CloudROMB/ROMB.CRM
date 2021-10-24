import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FooterlogComponent} from './footerlog.component';
import {LogService} from '../../services/log.service';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    FooterlogComponent
  ],
  providers: [LogService],
  exports: [
    FooterlogComponent
  ]
})
export class FooterlogModule {
  constructor(log: LogService) {

  }
}
