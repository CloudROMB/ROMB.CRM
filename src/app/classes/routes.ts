// Credentials
export interface CredentialItem {
  active: boolean;
  id: string;
  name: string;
  descr: string;
}

export interface CredentialsItem {
  active: boolean;
  id: string;
  name: string;
  group: string;
  descr: string;
  credentials: CredentialItem[];
}

// Metadata
export interface MenuItem {
  active?: boolean;
  id?: string;
  path: string; // must matches with routes in modules
  title: string;
  descr?: string;
  type?: string;
  icontype?: string;
  faicon?: string;
  collapse?: string;
  roles?: string[];
  children?: MenuItem[];
}

// Menu types
export enum mainMenuTypes {
  system = 'system',
  user = 'user',
  role = 'role'
}

// Menu Items
export const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    title: 'Панель управления',
    descr: 'Добро пожаловать в CRM',
    type: 'link',
    icontype: 'dashboard'
  },
  {
    path: '/cc-order',
    title: 'Заявка через КЦ',
    descr: 'Подать заявку через контактный центр',
    type: 'link',
    faicon: 'file-text-o'
  },
  {
    path: '/journal/reestr',
    title: 'Реестр',
    descr: 'Реестр документов',
    type: 'link',
    faicon: 'list'
  },
  {
    path: '/references',
    title: 'Справочники',
    type: 'sub',
    icontype: 'grid_on',
    collapse: 'references',
    children: [
      {
        path: 'companies',
        title: 'Партнеры',
        descr: 'Справочник партнеров',
        icontype: 'assignment_ind'
      },
      {
        path: 'departments',
        title: 'Подразделения',
        descr: 'Адреса точек продаж',
        icontype: 'location_city'
      },
      {
        path: 'banks',
        title: 'Банки-партнеры',
        descr: 'Справочник "Банки-партнеры"',
        icontype: 'account_balance'
      },
      {
        path: 'people',
        title: 'Клиенты',
        descr: 'Справочник "Клиентов"',
        icontype: 'shopping_cart'
      },
      {
        path: 'addresses',
        title: 'Адреса',
        descr: 'Справочник "Адресов"',
        icontype: 'location_on'
      },
      {
        path: 'attentions',
        title: 'Объявления',
        descr: 'Объявления для пользователей',
        faicon: 'delicious'
      }
    ]
  },
  {
    path: '/communications',
    title: 'Общение',
    type: 'sub',
    icontype: 'message',
    collapse: 'communications',
    children: [
      {
        path: 'mail',
        title: 'Письма',
        descr: 'Письма в электронной почте',
        icontype: 'email'
      },
      {
        path: 'messages',
        title: 'Чаты',
        descr: 'Сообщения в чатах',
        icontype: 'message'
      }
    ]
  },
  {
    path: '/tasks',
    title: 'Задачи',
    descr: 'Мои задачи',
    type: 'link',
    icontype: 'date_range'
  },
  {
    path: '/charts',
    title: 'Отчеты',
    type: 'link',
    faicon: 'bar-chart'
  },
  {
    path: '/currier/foxexpress',
    title: 'Заказать курьера',
    type: 'link',
    icontype: 'directions_car'
  },
  {
    path: '/system',
    title: 'Администрирование',
    type: 'sub',
    faicon: 'wrench',
    collapse: 'system',
    children: [
      {
        path: 'to-do',
        title: 'TO-DO задачи',
        type: 'link',
        icontype: 'done_all'
      },
      {
        path: 'users',
        title: 'Пользователи',
        icontype: 'people'
      },
      {
        path: 'roles',
        title: 'Роли',
        icontype: 'people_outline'
      },
      {
        path: 'metadata',
        title: 'Метаданные',
        type: 'link',
        icontype: 'settings_system_daydream'
      },
      {
        path: 'types',
        title: 'Типы объектов',
        descr: 'Типы объектов',
        icontype: 'line_style'
      },
      {
        path: 'log',
        title: 'Журнал событий',
        type: 'link',
        icontype: 'event'
      }
    ]
  }
];
