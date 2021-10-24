import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class EventsService {

  public events = [
    {
      type: 'message',
      message: 'Нераспределенная заявка',
      link: '#'
    },
    {
      type: 'message',
      message: 'Пришли документы от ИП Валенков И.И.',
      link: '#'
    },
    {
      type: 'message',
      message: 'Остался 1 час до завершения вашей задачи',
      link: '#'
    }
  ];

  constructor() {
  }

  getNewEvents() {
    return new Observable<object>(observer => {
      observer.next(this.events);
      observer.complete();
    });
  }

}
