import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {SidebarComponent} from './sidebar.component';
import {MatIconModule} from '@angular/material';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {PipesModule} from '../pipes/pipes.module';


@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    Angular2FontawesomeModule,
    PipesModule
  ],
  declarations: [
    SidebarComponent
  ],
  exports: [
    SidebarComponent
  ]
})

export class SidebarModule {}
