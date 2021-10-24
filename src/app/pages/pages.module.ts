import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PagesRoutes} from './pages.routing';
import {RegisterComponent} from './register/register.component';
import {LockComponent} from './lock/lock.component';
import {LoginComponent} from './login/login.component';
import {ModalsModule} from '../modals/modals.module';
import {FooterModule} from '../shared/footer/footer.module';
import {NotFound404Component} from './404/404.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    ReactiveFormsModule,
    ModalsModule,
    FooterModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    LockComponent,
    NotFound404Component
  ]
})

export class PagesModule {
}
