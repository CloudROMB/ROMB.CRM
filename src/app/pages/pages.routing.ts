import {Routes} from '@angular/router';
import {RegisterComponent} from './register/register.component';
import {LockComponent} from './lock/lock.component';
import {LoginComponent} from './login/login.component';
import {NotFound404Component} from './404/404.component';

export const PagesRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'lock',
    component: LockComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '404',
    component: NotFound404Component
  }
];
