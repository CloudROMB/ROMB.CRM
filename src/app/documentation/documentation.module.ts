import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DocumentationComponent} from './documentation.component';
import {RouterModule, Routes} from '@angular/router';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {MaterialModule} from '../material.module';
import {MultiElementsModule} from '../multielements/multielements.module';
import {DataTableModule} from '../data-table';
import {FormsModule} from '@angular/forms';
import {FooterlogModule} from '../shared/footerlog/footerlog.module';
import {SuggestionsModule} from '../suggestions/suggestions.module';
import {PipesModule} from '../pipes/pipes.module';
import {ComponentsModule} from '../components/components.module';
import {TextMaskModule} from 'angular2-text-mask';
import {UserComponent} from './user/user.component';
import {SystemComponent} from './system/system.component';

export const DocRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'menu',
        component: DocumentationComponent
      },
      {
        path: 'user',
        component: UserComponent
      },
      {
        path: 'user/:id',
        component: UserComponent
      },
      {
        path: 'system',
        component: SystemComponent
      },
      {
        path: 'system/:id',
        component: SystemComponent
      }
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DocRoutes),
    FormsModule,
    MaterialModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FooterlogModule,
    DataTableModule,
    Angular2FontawesomeModule,
    SuggestionsModule,
    MultiElementsModule,
    PipesModule,
    ComponentsModule,
    TextMaskModule
  ],
  declarations: [
    DocumentationComponent,
    UserComponent,
    SystemComponent
  ]
})
export class DocumentationModule {
}
