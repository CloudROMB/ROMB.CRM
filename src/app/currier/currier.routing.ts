import {Routes} from '@angular/router';
import {FoxexpressComponent} from './foxexpress/foxexpress.component';

export const CurrierRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'foxexpress',
      component: FoxexpressComponent
    }]
  }
];
