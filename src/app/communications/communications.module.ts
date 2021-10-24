import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MailComponent} from './mail/mail.component';
import {ChatsListComponent} from './messages/chats/chats.component';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {FooterlogModule} from '../shared/footerlog/footerlog.module';
import {CommunicationsRoutes} from './communications.routing';
import {MaterialModule} from '../material.module';
import {DataTableModule} from '../data-table';
import {PipesModule} from '../pipes/pipes.module';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {MultiElementsModule} from '../multielements/multielements.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CommunicationsRoutes),
    FormsModule,
    MaterialModule,
    FooterlogModule,
    DataTableModule,
    PipesModule,
    Angular2FontawesomeModule,
    MultiElementsModule
  ],
  declarations: [
    MailComponent,
    ChatsListComponent
  ],
  exports: []
})
export class CommunicationsModule {
}
