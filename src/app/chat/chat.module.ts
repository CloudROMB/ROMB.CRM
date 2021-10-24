import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChatComponent} from './chat.component';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    Angular2FontawesomeModule
  ],
  declarations: [
    ChatComponent
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule {
}
