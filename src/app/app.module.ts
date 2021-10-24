import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {CommonModule, HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {SidebarModule} from './sidebar/sidebar.module';
import {FooterModule} from './shared/footer/footer.module';
import {NavbarModule} from './shared/navbar/navbar.module';
import {AdminLayoutComponent} from './layouts/admin/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth/auth-layout.component';

import {AppRoutes} from './app.routing';
import {AuthService} from './services/auth.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LogService} from './services/log.service';
import {ChatWidgetModule} from './communications/messages/widget/widget.module';
import {SharedService} from './services/shared.service';
import {ApiService} from './services/api.service';
import {MaterialModule} from './material.module';
import {BrowserModule} from '@angular/platform-browser';
import {MenusModule} from './menus/menus.module';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {TokenInterceptor} from './services/token.interceptor';
import {AlertsModule} from './alerts/alerts.module';
import {SuggestionsModule} from './suggestions/suggestions.module';
import {MAT_DATE_LOCALE} from '@angular/material';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {CURRENCY_MASK_CONFIG, CurrencyMaskConfig} from 'ng2-currency-mask/src/currency-mask.config';
import {debugLog, errorLog} from './app.log';
import {environment} from '../environments/environment';
import {SocketService} from './services/socket.service';
import {ChatModule} from './chat/chat.module';

export * from './classes/translation';
export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  decimal: ',',
  precision: 0,
  prefix: '',
  suffix: ' руб.',
  thousands: '\''
};

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(AppRoutes, {useHash: true}),
    HttpClientModule,
    MaterialModule.forRoot(),
    Angular2FontawesomeModule,
    // custom modules
    AlertsModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    MenusModule,
    ChatWidgetModule,
    ChatModule,
    SuggestionsModule,
    CurrencyMaskModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent
  ],
  exports: [
    MenusModule,
    Angular2FontawesomeModule,
    MaterialModule
  ],
  providers: [
    Location,
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig},
    // custom services
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    ApiService,
    LogService,
    SharedService,
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public auth: AuthService) {
    debugLog('environment', environment);
    // errorLog ('environment', environment);
  }
}
