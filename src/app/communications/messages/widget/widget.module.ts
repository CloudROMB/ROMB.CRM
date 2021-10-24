import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChatWidgetComponent} from './widget.component';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    ChatWidgetComponent
  ],
  exports: [
    ChatWidgetComponent
  ]
})

export class ChatWidgetModule {
}
