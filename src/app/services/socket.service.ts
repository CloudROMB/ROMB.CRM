import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as io from 'socket.io-client';
import * as Rx from 'rxjs/Rx';
import {environment} from '../../environments/environment';
import {debugLog} from '../app.log';
import {Subject} from 'rxjs';

@Injectable()
export class SocketService {
  public isChatActive = false;
  public connected = false;
  public messages: Subject<any>;

  // Our socket connection
  public socket;

  constructor() {
    this.messages = <Subject<any>>this.connect()
      .map((response: any): any => {
        return response;
      });
  }

  connect(): Rx.Subject<MessageEvent> {
    this.socket = io(environment.ws_url);
    this.connected = true;

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    const observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        debugLog('Received message from API.Server');
        observer.next(data);
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        debugLog('Socked disconnected:', reason);
        observer.next(reason);
        // observer.complete();

        setTimeout(this.connect, 1000);
      });

      return () => {
        this.socket.disconnect();
      };
    });

    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    const _observer = {
      next: (data: Object) => {
        this.socket.emit('message', JSON.stringify(data));
      }
    };

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Rx.Subject.create(_observer, observable);
  }

  // Our simplified interface for sending
  // messages back to our socket.io server
  async sendMsg(msg) {
    if (!this.connected) {
      debugLog('Reconnect socket');
      this.messages = await (<Subject<any>>this.connect()
        .map((response: any): any => {
          return response;
        }))
        .toPromise();
    }
    debugLog('Send message:', msg);
    this.messages.next(msg);
  }
}
