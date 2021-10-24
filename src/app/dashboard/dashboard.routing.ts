import {Routes} from '@angular/router';

import {DashboardComponent} from './dashboard.component';
import {DashboardPartnerComponent} from './dashboard-partner.component';

export const DashboardRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'dashboardp',
        component: DashboardPartnerComponent
      }
    ]
  }
];
