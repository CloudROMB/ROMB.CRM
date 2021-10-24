import {FooterlogModule} from '../shared/footerlog/footerlog.module';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from '../material.module';
import {DataTableModule} from '../data-table';
import {PipesModule} from '../pipes/pipes.module';
import {TypesComponent} from './types/types.component';
import {LogComponent} from './log/log.component';
import {ToDoComponent} from './to-do/to-do.component';
import {OWL_DATE_TIME_LOCALE, OwlDateTimeModule, OwlNativeDateTimeModule, OwlDateTimeIntl} from 'ng-pick-datetime';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {UsersComponent} from './users/users.component';
import {RolesComponent} from './roles/roles.component';
import {DefaultIntl} from '../classes/constants';
import {MetadataComponent} from './metadata/metadata.component';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown';
import {SuggestionsModule} from '../suggestions/suggestions.module';
import {MultiElementsModule} from '../multielements/multielements.module';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {ComponentsModule} from '../components/components.module';

export const SystemRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'types',
        component: TypesComponent
      },
      {
        path: 'types/:id',
        component: TypesComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'metadata',
        component: MetadataComponent
      },
      {
        path: 'metadata/:id',
        component: MetadataComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'users',
        component: UsersComponent
      },
      {
        path: 'users/:id',
        component: UsersComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'roles',
        component: RolesComponent
      },
      {
        path: 'roles/:id',
        component: RolesComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'log',
        component: LogComponent
      },
      {
        path: 'log/:id',
        component: LogComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'techsupport',
        component: ToDoComponent
      },
      {
        path: 'techsupport/:id',
        component: ToDoComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SystemRoutes),
    FormsModule,
    MaterialModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FooterlogModule,
    DataTableModule,
    Angular2FontawesomeModule,
    AngularMultiSelectModule,
    PipesModule,
    SuggestionsModule,
    MultiElementsModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'ru'},
    {provide: OwlDateTimeIntl, useValue: DefaultIntl}
  ],
  declarations: [
    TypesComponent,
    LogComponent,
    ToDoComponent,
    RolesComponent,
    UsersComponent,
    MetadataComponent
  ]
})
export class SystemModule {
}
