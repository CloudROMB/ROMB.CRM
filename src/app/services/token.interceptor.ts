import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse, HttpHeaderResponse, HttpSentEvent
} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs/Observable';
import {debugLog} from '../app.log';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public auth: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // debugLog('BEARER:', this.auth.authToken);
    if (this.auth.authToken) {
      // debugLog('TOKEN BEARER:', this.auth.authToken);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.authToken}`
        }
      });
    } else {
      debugLog('NO TOKEN BEARER');
    }

    return next.handle(request).map(event => {
      if (event instanceof HttpResponse) {
        if (event.body && event.body.token) {
          debugLog('TOKEN body:', event.body.token);
          this.auth.storeToken(event.body.token);
        } else if (event.headers && event.headers.has('token')) {
          debugLog('TOKEN headers:', event.headers.get('token'));
          this.auth.storeToken(event.headers.get('token'));
        }
      }
      return event;
    });
  }
}
