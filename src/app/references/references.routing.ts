import {Routes} from '@angular/router';

import {BankPartnersComponent} from './bank-partners/bank-partners.component';
import {AddressesComponent} from './addresses/addresses.component';
import {DepartmentsComponent} from './departments/departments.component';
import {ContractorsComponent} from './contractors/contractors.component';
import {PeopleComponent} from './people/people.component';
import {AttentionsComponent} from './attentions/attentions.component';
import {BrandsComponent} from './brands/brands.component';
import {ReferenceComponent} from './reference/reference.component';

export const ReferencesRoutes: Routes = [
  {
    path: 'companies',
    children: [
      {
        path: '',
        component: ContractorsComponent
      },
      {
        path: ':id',
        component: ContractorsComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'departments',
        component: DepartmentsComponent
      },
      {
        path: 'departments/:id',
        component: DepartmentsComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'brands',
        component: BrandsComponent
      },
      {
        path: 'brands/:id',
        component: BrandsComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'banks',
        component: BankPartnersComponent
      },
      {
        path: 'banks/:id',
        component: BankPartnersComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'people',
        component: PeopleComponent
      },
      {
        path: 'people/:id',
        component: PeopleComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'addresses',
        component: AddressesComponent
      },
      {
        path: 'addresses/:id',
        component: AddressesComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'attentions',
        component: AttentionsComponent
      },
      {
        path: 'attentions/:id',
        component: AttentionsComponent
      }
    ]
  },
  {
    path: '**',
    children: [
      {
        path: '',
        component: ReferenceComponent
      },
      {
        path: ':id',
        component: ReferenceComponent
      }
    ]
  }
];
