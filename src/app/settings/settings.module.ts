import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SystemSettingsComponent} from './system/system.component';
import {RouterModule} from '@angular/router';
import {SettingsRoutes} from './settings.routing';
import {UserPageComponent} from './userpage/user-page.component';
import {MaterialModule} from '../material.module';
import {FormsModule} from '@angular/forms';
import {MultiElementsModule} from '../multielements/multielements.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
    FormsModule,
    MaterialModule,
    MultiElementsModule
  ],
  declarations: [
    SystemSettingsComponent,
    UserPageComponent
  ]
})

export class SettingsModule {
}
