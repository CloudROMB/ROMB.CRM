import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContextMenuComponent} from './contextmenu/contextmenu.component';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../material.module';
import {SidebarHoverComponent} from './sidebar/sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule
  ],
  declarations: [
    ContextMenuComponent,
    SidebarHoverComponent
  ],
  providers: [],
  exports: [
    SidebarHoverComponent,
    ContextMenuComponent
  ]
})
export class MenusModule {
}
