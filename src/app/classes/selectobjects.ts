export interface DeliveryStatus {
  id: number; // порядоковый номер статуса, очередность статусов имеет значение
  name: string; // краткое название статуса
  descr?: string; // полное описание статуса
  visible?: boolean; // этот статус отображается в списке выбора статусов
}

export const defaultDeliveryStatuses: DeliveryStatus[] = [
  {
    id: 3020,
    name: 'Необходимо вернуть КД',
    descr: 'Партнеру необходимо вернуть кредитное досье в банк'
  },
  {
    id: 3030,
    name: 'Необходима инкасация',
    descr: 'Необходима инкасация кредитного досье сотрудником'
  },
  {
    id: 3040,
    name: 'Необходимо прислать курьера',
    descr: 'Требуется прислать курьера экспресс-доставки'
  },
  {
    id: 3100,
    name: 'Документы у курьера',
    descr: 'Курьер забрал документы у партнера'
  },
  {
    id: 3200,
    name: 'Документы у менеджера банка',
    descr: 'Менеджер банка забрал документы у партнера'
  },
  {
    id: 3300,
    name: 'Документы в банке',
    descr: 'Кредитное досье сдано в Банк'
  }
];

export interface PaymentStatus {
  id: number; // порядоковый номер статуса, очередность статусов имеет значение
  name: string; // краткое название статуса
  descr?: string; // полное описание статуса
  visible?: boolean; // этот статус отображается в списке выбора статусов
}

export const defaultPaymentStatuses: PaymentStatus[] = [
  {
    id: 5010,
    name: 'Ожидает оплаты'
  },
  {
    id: 5020,
    name: 'Оплачено банком'
  },
  {
    id: 5030,
    name: 'Оплачено брокером'
  },
  {
    id: 5040,
    name: 'Оплачено авансом'
  }
];

export interface PrintForms {
  id: string; // порядоковый номер печатной формы
  name: string; // краткое название печатной формы
  descr?: string; // полное описание печатной формы
  visible?: boolean; // эта печатная форма отображается в списке выбора
}

export const defaultPrintForms: PrintForms[] = [
  {
    id: 'borrowerProfile',
    name: 'Опросник',
    descr: 'Опросник для анкеты заёмщика',
  },
  {
    id: 'passport',
    name: 'Копия паспорта',
    descr: 'Копия паспорта клиента',
    visible: false
  },
  {
    id: 'anketa',
    name: 'Анкета',
    descr: 'Готовая анкета клиента',
    visible: false
  }
];

export interface OrderStatuses {
  id: number; // порядоковый номер статуса, очередность статусов имеет значение
  name: string; // краткое название статуса
  descr?: string; // полное описание статуса
  visible?: boolean; // этот статус отображается в списке выбора статусов
  showOrganization?: boolean; // Значение колонки «На кого оформлен» отображается в этом статусе
  hasContractBlank?: boolean; // В этом статусе проверять флаг
  hasSignedScans?: boolean; // В этом статусе отображать состояние флага
  signStatus?: boolean; // В этом статусе отображать состояние флага
  checkScansStatus?: boolean; // В этом статусе отображать состояние флага
  paymentStatus?: boolean; // В этом статусе отображать состояние перечисления
  deliveryStatus?: boolean; // В этом статусе отображать состояние перечисления
}

export const defaultOrderStatuses: OrderStatuses[] = [
  {
    id: 0,
    name: 'Выберите статус!',
    descr: 'Статус заявки не определен',
    visible: false
  },
  {
    id: 10,
    name: 'Очередь в КЦ',
    descr: 'Нераспределенная заявка'
  },
  {
    id: 20,
    name: 'Назначен ответственный',
    descr: 'Назначен ответственный сотрудник (Моя заявка)'
  },
  {
    id: 25,
    name: 'Некорректная заявка',
    descr: 'Неверно заполнена заявка (обратитесь к менеджеру)'
  },
  {
    id: 30,
    name: 'Завершено анкетирование',
    descr: 'Завершено анкетирование клиента',
    visible: false
  },
  {
    id: 40,
    name: 'Рассмотрение',
    descr: 'Отправлено в банк, ожидание решения'
  },
  {
    id: 50,
    name: 'Одобрено',
    descr: 'Одобрен кредит',
    showOrganization: true,
    hasContractBlank: true,
    hasSignedScans: true,
    signStatus: true,
    checkScansStatus: true,
    paymentStatus: true,
    deliveryStatus: true
  },
  {
    id: 60,
    name: 'Отказ Клиента',
    descr: 'Отказ клиента от кредита'
  },
  {
    id: 70,
    name: 'Отказ FreshCredit',
    descr: 'Отказ, клиент не прошел прескоринг'
  },
  {
    id: 80,
    name: 'Отказ Банков',
    descr: 'Отказ, клиент не прошел скоринг банков'
  },
  {
    id: 90,
    name: 'Кредит выдан',
    descr: 'Кредит выдан',
    showOrganization: true,
    hasSignedScans: true,
    signStatus: true,
    checkScansStatus: true,
    paymentStatus: true,
    deliveryStatus: true
  },
  {
    id: 100,
    name: 'Оформить возврат покупки',
    descr: 'Клиент оформил обратился за возвратом товара/услуги',
    showOrganization: true,
    hasSignedScans: true,
    signStatus: true,
    checkScansStatus: true,
    paymentStatus: true,
    deliveryStatus: true
  },
  {
    id: 105,
    name: 'Покупка возвращена',
    descr: 'Клиент оформил возврат товара/услуги',
    showOrganization: true,
    hasSignedScans: true,
    signStatus: true,
    checkScansStatus: true,
    paymentStatus: true,
    deliveryStatus: true
  }
];
