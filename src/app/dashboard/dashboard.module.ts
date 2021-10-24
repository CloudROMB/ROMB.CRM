import {NgModule, OnDestroy, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MdModule} from '../md/md.module';

import {DashboardComponent} from './dashboard.component';
import {DashboardRoutes} from './dashboard.routing';
import {MaterialModule} from '../material.module';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {PipesModule} from '../pipes/pipes.module';
import {DashboardPartnerComponent} from './dashboard-partner.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
    Angular2FontawesomeModule,
    FormsModule,
    MdModule,
    MaterialModule,
    PipesModule
  ],
  declarations: [
    DashboardComponent,
    DashboardPartnerComponent
  ]
})

export class DashboardModule {
}
