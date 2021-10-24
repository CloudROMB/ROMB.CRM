import {Routes} from '@angular/router';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'pages/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'system',
        loadChildren: './system/system.module#SystemModule'
      },
      {
        path: 'orders',
        loadChildren: './orders/orders.module#OrdersModule'
      },
      {
        path: 'communications',
        loadChildren: './communications/communications.module#CommunicationsModule'
      },
      {
        path: 'maps',
        loadChildren: './maps/maps.module#MapsModule'
      },
      {
        path: 'reports',
        loadChildren: './charts/charts.module#ChartsModule'
      },
      {
        path: 'doc',
        loadChildren: './documentation/documentation.module#DocumentationModule'
      },
      {
        path: 'currier',
        loadChildren: './currier/currier.module#CurrierModule'
      },
      {
        path: 'journal',
        loadChildren: './journal/journal.module#JournalModule'
      },
      {
        path: 'references',
        loadChildren: './references/references.module#ReferencesModule'
      },
      {
        path: 'tasks',
        loadChildren: './tasks/tasks.module#TasksModule'
      },
      {
        path: 'calendar',
        loadChildren: './calendar/calendar.module#CalendarModule'
      },
      {
        path: 'settings',
        loadChildren: './settings/settings.module#SettingsModule'
      },
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'pages',
        loadChildren: './pages/pages.module#PagesModule'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/pages/404'
  }
];
