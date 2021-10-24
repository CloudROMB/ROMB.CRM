import {Routes} from '@angular/router';
import {JournalComponent} from './journal.component';

export const JournalRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'reestr',
        component: JournalComponent
      },
      {
        path: 'reestr/:id',
        component: JournalComponent
      }
    ]
  }
];
