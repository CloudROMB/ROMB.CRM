import {Routes} from '@angular/router';
import {MailComponent} from './mail/mail.component';
import {ChatsListComponent} from './messages/chats/chats.component';

export const CommunicationsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'mail',
        component: MailComponent
      },
      {
        path: 'mail/:id',
        component: MailComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'messages',
        component: ChatsListComponent
      },
      {
        path: 'messages/:id',
        component: ChatsListComponent
      }
    ]
  }
];
