import {NgModule} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {FioPipe} from './fio.pipe';
import {CutcellPipe} from './cutcell.pipe';
import {SafeHtmlPipe} from './safe-html.pipe';
import {ShortnamePipe} from './shortname.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CutcellPipe,
    FioPipe,
    SafeHtmlPipe,
    ShortnamePipe
  ],
  providers: [
    DatePipe,
    CurrencyPipe
  ],
  exports: [
    CutcellPipe,
    FioPipe,
    SafeHtmlPipe,
    DatePipe,
    CurrencyPipe
  ]
})
export class PipesModule {
}
