import {Routes} from '@angular/router';
import {SystemSettingsComponent} from './system/system.component';
import {UserPageComponent} from './userpage/user-page.component';

export const SettingsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'system',
        component: SystemSettingsComponent
      },
      {
        path: 'userpage',
        component: UserPageComponent
      },
      {
        path: '**',
        redirectTo: '/pages/404'
      },
    ]
  },
];
