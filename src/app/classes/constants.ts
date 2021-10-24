import {ContextMenuItem, ContextMenuItemTypes} from './types';

export const DefaultIntl = {
  /** A label for the up second button (used by screen readers).  */
  upSecondLabel: 'Add a second',

  /** A label for the down second button (used by screen readers).  */
  downSecondLabel: 'Minus a second',

  /** A label for the up minute button (used by screen readers).  */
  upMinuteLabel: 'Add a minute',

  /** A label for the down minute button (used by screen readers).  */
  downMinuteLabel: 'Minus a minute',

  /** A label for the up hour button (used by screen readers).  */
  upHourLabel: 'Add a hour',

  /** A label for the down hour button (used by screen readers).  */
  downHourLabel: 'Minus a hour',

  /** A label for the previous month button (used by screen readers). */
  prevMonthLabel: 'Previous month',

  /** A label for the next month button (used by screen readers). */
  nextMonthLabel: 'Next month',

  /** A label for the previous year button (used by screen readers). */
  prevYearLabel: 'Previous year',

  /** A label for the next year button (used by screen readers). */
  nextYearLabel: 'Next year',

  /** A label for the 'switch to month view' button (used by screen readers). */
  switchToMonthViewLabel: 'Выбрать месяц',

  /** A label for the 'switch to year view' button (used by screen readers). */
  switchToYearViewLabel: 'Выбрать год',

  /** A label for the cancel button */
  cancelBtnLabel: 'Закрыть',

  /** A label for the set button */
  setBtnLabel: 'Выбрать',

  /** A label for the range 'from' in picker info */
  rangeFromLabel: 'С',

  /** A label for the range 'to' in picker info */
  rangeToLabel: 'По'
};

export const defaultContextMenu: ContextMenuItem[] = [
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Взять в работу',
    id: 'apply'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Добавить новый',
    id: 'new'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Создать дубликат карточки',
    id: 'duplicate'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Просмотреть',
    id: 'view'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Редактировать',
    id: 'edit'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Показать/скрыть удаленные',
    id: 'showDeleted'
  },
  {
    type: ContextMenuItemTypes.SEPARATOR
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Удалить/Восстановить выбранное',
    id: 'delete'
  }
];

export const defaultSelectModalContextMenu: ContextMenuItem[] = [
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Выбрать элемент',
    id: 'select'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Отказаться от выбора',
    id: 'cancel'
  }
];

export const defaultMailContextMenu: ContextMenuItem[] = [
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Открыть письмо',
    id: 'edit'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Ответить на письмо',
    id: 'answer_mail'
  },
  {
    type: ContextMenuItemTypes.SEPARATOR
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Отметить обработанным',
    id: 'set_executed_flag'
  },
  {
    type: ContextMenuItemTypes.ACTION,
    text: 'Создать кредитную заявку',
    id: 'get_order_in_work'
  }
];

export const defaultCollectionTypes = [
  {id: 'reference', view: 'Справочник'},
  {id: 'journal', view: 'Журнал документов'},
  {id: 'events', view: 'События'},
  {id: 'tasks', view: 'Задачи'},
  {id: 'mail', view: 'Почта'},
  {id: 'messages', view: 'Сообщения'},
  {id: 'report', view: 'Отчеты'},
  {id: 'courier', view: 'Службы доставки'},
  {id: 'system', view: 'Системный справочник'},
  {id: 'documentation', view: 'Документация'}
];

export const imageFileTypes = ['jpeg', 'jpg', 'png', 'gif', 'tif', 'tiff', 'bmp'];
export const officeFileTypes = ['doc', 'docx', 'xls', 'xlsx', 'msword', 'msexcel'];
export const archiveFileTypes = ['zip', 'arj', 'rar'];
export const pdfFileTypes = ['pdf'];
