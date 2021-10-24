import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LogService {

  public log = [
    {
      id: 1,
      event: {
        author: 'admin',
        stamp: '2018-01-05 18:10:15',
        descr: 'Создан элемент [Андреева Т.В.]'
      },
      object: {
        type: 'Справочник',
        kind: 'Пользователи',
        link: '/references/users'
      }
    },
    {
      id: 2,
      event: {
        author: 'admin',
        stamp: '2018-01-05 18:11:58',
        descr: 'Создан элемент [Михаличенко А.А.]'
      },
      object: {
        type: 'Справочник',
        kind: 'Пользователи',
        link: '/references/users'
      }
    },
    {
      id: 3,
      event: {
        author: 'admin',
        stamp: '2018-01-05 18:12:10',
        descr: 'Создан элемент [CEO]'
      },
      object: {
        id: '12m120021m102mf21mf012mf012',
        type: 'Справочник',
        kind: 'Роли',
        link: '/references/roles'
      }
    },
    {
      id: 4,
      event: {
        author: 'admin',
        stamp: '2018-01-05 18:13:37',
        descr: 'Создан элемент [Сотрудник контактного центра]'
      },
      object: {
        type: 'Справочник',
        kind: 'Роли',
        link: '/references/roles'
      }
    },
    {
      id: 5,
      event: {
        author: 'admin',
        stamp: '2018-01-06 11:25:01',
        descr: 'Создан документ [04.11.17, ООО "Импульс Лайф", Федяева Людмила Рудольфовна]'
      },
      object: {
        type: 'Документ',
        kind: 'Кредиты',
        link: '/journal/reestr'
      }
    },
    {
      id: 6,
      event: {
        author: 'admin',
        stamp: '2018-01-06 11:31:22',
        descr: 'Изменен документ [04.11.17, 2312, ООО "Импульс Лайф", Федяева Людмила Рудольфовна]'
      },
      object: {
        type: 'Документ',
        kind: 'Кредиты',
        link: '/journal/reestr'
      }
    }
  ];

  constructor() {
  }

  getLog(params: any | null) {
    return new Observable<object>(observer => {
      observer.next(this.log);
      observer.complete();
    });
  }
}
