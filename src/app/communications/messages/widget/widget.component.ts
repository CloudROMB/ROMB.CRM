import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs';
import {debugLog, errorLog} from '../../../app.log';
import {AuthService} from '../../../services/auth.service';
import {SocketService} from '../../../services/socket.service';

@Component({
  selector: 'romb-chat-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  msgSubscription: Subscription;

  items = [
    {
      id: 1,
      message: 'Сообщение 3',
      link: '/dashboard',
      sender: 'Иванова Т.И'
    },
    {
      id: 4,
      message: 'Сообщение 10',
      link: '/dashboard',
      sender: 'БРС Васюта Игорь'
    },
    {
      id: 5,
      message: 'Всем работать!',
      link: '/communications/messages',
      sender: 'Сулименко Д.Г.'
    }
  ];

  constructor(private ws: SocketService,
              private auth: AuthService) {

  }

  ngOnInit() {
    this.msgSubscription = this.ws.messages.subscribe(msg => {
      debugLog('+ message:', msg);
    });
  }

  ngOnDestroy() {
    this.msgSubscription.unsubscribe();
  }

  sendMessage(e) {
    setTimeout(() => {
      this.ws.isChatActive = true;
    }, 500);

    // this.ws.sendMsg({
    //   message: 'Test message ' + Math.random(),
    //   token: this.auth.authToken,
    //   user: this.auth.user.name
    // })
    //   .then(res => {
    //     debugLog('sendMessage():', res);
    //   })
    //   .catch(err => {
    //     errorLog('sendMessage():', err);
    //   });
  }

  connected(): boolean {
    return this.ws.connected;
  }

  connectedClass(): string {
    // debugLog('+', this.ws.connected);
    if (this.ws.connected) {
      return 'btn-success';
    } else {
      return 'btn-danger';
    }
  }
}
