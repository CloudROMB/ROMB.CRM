import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TasksRoutes} from './tasks.routing';

import {TasksComponent} from './tasks.component';
import {MaterialModule} from '../material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TasksRoutes),
    FormsModule,
    MaterialModule
  ],
  declarations: [TasksComponent]
})

export class TasksModule {
}
