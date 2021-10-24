import {CommonModule} from '@angular/common';
import {SuggectionDirective} from './suggection';
import {NgModule} from '@angular/core';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SuggectionDirective
  ],
  providers: [],
  exports: [
    SuggectionDirective
  ]
})
export class SuggestionsModule {
}
