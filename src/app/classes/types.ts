import {UUID} from 'angular2-uuid';

export enum alertsTypes {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  PRIMARY = 'primary',
  SECONDARY = 'rose'
}

export enum ContextMenuItemTypes {
  LINK,
  ROUTE,
  SEPARATOR,
  ACTION
}

export enum SuggestionTypes {
  NAME = 'NAME',
  ADDRESS = 'ADDRESS',
  COMPANY = 'PARTY',
  BANK = 'BANK',
  EMAIL = 'EMAIL'
}

export class ContextMenuItem {
  type: ContextMenuItemTypes;
  id?: string;
  link?: string;
  text?: string;
}

export class CommonTypes {
  alerts: alertsTypes;
}

export class Reference {
  id: string;
  code: string;
  name: string;
  source: string;
}


export enum genders {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export class UserName {
  gender: genders | null;
  name: string | null;
  patronymic: string | null;
  surname: string | null;
  fullName: string;
}

export class User {
  _id: string | null;
  login: string;
  name: string;
  roles?: Reference[];
  FIO?: UserName;
  photo?: string; // URL for photo
  company?: Reference;
  department?: Reference;
  phoneWork?: string;
  phonePrivate?: string;
}

// contacts arrays
export enum ContactType {
  phone = 'Телефон',
  email = 'E-mail',
  web = 'Веб-сайт',
  skype = 'Скайп'
}

export interface Contact {
  id: string;
  type: ContactType;
  value?: string;
  comment?: string;
}

export const defaultContactsLabels = {
  name: 'ФИО',
  editMode: 'Редактировать контакты',
  viewMode: 'В режим просмотра',
  position: 'Должность',
  company: 'Компания',
  department: 'Подразделение',
  comment: 'Комментарий',
  contacts: 'Контактные данные',
  addCompany: 'Указать компанию',
  addComment: 'Добавить комментарий',
  removeCompany: 'Убрать компанию',
  removeComment: 'Убрать комментарий',
  addPhone: 'Добавить телефон',
  removePhone: 'Убрать телефон',
  addEmail: 'Добавить e-mail',
  removeEmail: 'Убрать e-mail',
  addSkype: 'Добавить Skype',
  removeSkype: 'Убрать Skype',
  addWeb: 'Добавить веб-сайт',
  removeWeb: 'Убрать веб-сайт',
  addContact: 'Добавить контакт',
  removeContact: 'Удалить этот контакт',
  addPerson: 'Добавить контактное лицо',
  removePerson: 'Удалить это контактное лицо',
  registerPerson: 'Зарегистрировать как пользователя Платформы'

};

export interface Contacts {
  id: string;
  name: string,
  position?: string,
  company?: string,
  department?: {},
  comment?: string;
  contacts?: Contact[]
}

export enum customerIDCategory {
  passport = 'Паспорт',
  viditel = 'Водительское удостоверение',
  pens = 'Пенсионное удостоверение',
  zagran = 'Заграничный паспорт',
  voenbilet = 'Военный билет',
  other = 'Прочий'
}

// FILES LIST FILES
export const defaultFilesLabels = {
  componentDescr: 'Приложенные файлы',
  description: 'Комментарий к файлу',
  editMode: 'Редактировать файлы',
  viewMode: 'В режим просмотра',
  expandCategories: 'Развернуть все категории',

  fileName: 'Оригинальное имя файла',
  fileCategory: 'Категория файлов',
  fieldName: 'Название поля',
  contentType: 'Тип файла',
  generatedFileName: 'Имя файла',
  length: 'Размер (Bytes)',
  date: 'Дата создания',
  previewFile: 'Просмотр',
  openFile: 'Скачать (открыть в новой закладке)',
  documentCorrect: 'Корректный',
  documentCorrectTitle: 'Этот документ проверен менеджером',

  uploading: 'Загружаются файлы...',
  addFile: 'Добавить файлы',
  removeFile: 'Удалить этот файл',
  addCategory: 'Добавить группу файлов',
  removeCategory: 'Удалить группу',
  changeCategory: 'Изменить категорию файла',
  saveChanges: 'Сохранить изменения',

  closePreview: 'Закрыть окно — кнопка "Escape"',
  nextPhoto: 'Следующая фотография — кнопка "→", последняя — Конпка "End"',
  previousPhoto: 'Предыдущая фотография — кнопка "←", первая — Конпка "Home"'
};

export const defaultBanksLabels = {
  name: 'Наименование банка',
  productName: 'Название кредитного продукта',
  description: 'Описание банка',
  bankEnabled: 'Банк включен/выключен',
  productEnabled: 'Включен/выключен',
  productDescr: 'Описание продукта',
  productRate: 'Процентная ставка',
  editMode: 'Редактировать список банков',
  viewMode: 'В режим просмотра',

  addBank: 'Добавить банк',
  removeBank: 'Удалить этот банк',
  addProduct: 'Добавить продукт',
  removeProduct: 'Удалить продукт'
};

export enum FileCategory {
  other = 'Прочие',
  photo = 'Фотографии',
  passport_photo = 'Паспорт страница с фото',
  passport_registration = 'Паспорт страница с регистрацией',
  addDocs = 'Второй документ',
  agreement = 'Согласие',
  contract = 'Бланки договора',
  contractSigned = 'Подписанный договор',
  registers = 'Реестры и отчеты'
}

export enum PrimaryFilesСategory {
  passport_photo = 'Паспорт страница с фото',
  passport_registration = 'Паспорт страница с регистрацией',
  addDocs = 'Второй документ',
  agreement = 'Согласие',
  photo = 'Фотографии'
}

// export const FileCategoryArray = [
//   {
//     id: 1,
//     code: 'other',
//     name: 'Прочие'
//   },
//   {
//     id: 2,
//     code: 'photo',
//     name: 'Фотографии'
//   },
//   {
//     id: 3,
//     code: 'passport',
//     name: 'Паспорт РФ'
//   },
//   {
//     id: 4,
//     code: 'secondDoc',
//     name: 'Второй документ'
//   },
//   {
//     id: 5,
//     code: 'agreement',
//     name: 'Согласие'
//   },
//   {
//     id: 6,
//     code: 'contract',
//     name: 'Бланки договора'
//   },
//   {
//     id: 7,
//     code: 'contractSigned',
//     name: 'Подписанный договор'
//   },
//   {
//     id: 8,
//     code: 'registers',
//     name: 'Подписанный договор'
//   }
// ]

// export const PrimaryFilesСategory = [
//   'photo',
//   'passport',
//   'addDocs',
//   'agreement'
// ]

export enum FileTypes {
  other,
  image,
  pdf,
  office,
  archive
}

export interface MULFile {
  id: string;
  fileName: string;
  description: string;
  fieldname: string;
  correct: boolean;
  contentType: string;
  generatedFileName: string;
  length: number;
  stamp: Date;
}

export interface MULFiles {
  id: string;
  category: FileCategory,
  list?: MULFile[]
}

export interface MULFinanceProduct {
  id: string;
  name: string;
  rate?: number;
  period?: number;
  descr: string;
  active: boolean;
}

export interface MULBank {
  id: string;
  name: string;
  object?: any;
  descr?: string,
  active?: boolean;
  products?: MULFinanceProduct[]
}

export interface MULBankAccount {
  id: string
  bank_name?: '',
  bank?: object;
  settlement_account?: any;
  active?: boolean;
}

// MULTIELEMENTS KEY VALUE JSON ARRAY
export const defaultKeyValueLabels = {
  editMode: 'Редактировать значения',
  viewMode: 'Просмотр JSON',
  saveChanges: 'Сохранить изменения',
  autoSaveChanges: 'Автосохранение',
  cancelChanges: 'Отменить изменения',
  key: 'Название поля',
  value: 'Значение',
  checkbox: 'логический флаг',
  object: 'Объект',
  array: 'Массив',
  addObjectKey: 'Добавить значение объекта',
  addIn: 'добавить',
  addInArray: 'В массив добавить',
  addInObject: 'В объект добавить',
  addArray: 'Добавить массив',
  addObject: 'Добавить объект',
  addField: 'Добавить поле',
  removeField: 'Удалить это поле',
  removeObject: 'Удалить этот объект',
  copyObject: 'Копировать этот объект',
  getUpObject: 'Поднять выше',
  getDownObject: 'Опустить ниже',
  errorKeyEmpty: 'Укажите все наименования для значений!',
  errorObjectStructure: 'Неверная структура объекта, проверьте ключи и значения'
};

export interface MULKeyValue2 {
  id: string;
  expanded: boolean;
  name?: string;
  category?: MULKeyValueCategory;
  field?: any;
  object?: MULKeyValue[];
}

export class MULKeyValue {
  id: string;
  expanded: boolean;
  name?: string;
  category?: MULKeyValueCategory;
  field?: any;
  object?: MULKeyValue[];

  constructor(category: MULKeyValueCategory, name?: string, expanded?: boolean) {
    this.id = UUID.UUID();
    this.category = category;
    if (category === MULKeyValueCategory.field) {
      this.name = name ? name : 'field' + (Math.random() * 1000000).toFixed(0).toString();
    } else {
      this.name = name ? name : null;
    }
    if (expanded === true) {
      this.expanded = true;
    } else {
      this.expanded = this.name === 'root';
    }
    this.field = null;
    this.object = null;
  }

  copy(): MULKeyValue {
    const obj = JSON.parse(JSON.stringify(Object(this)));
    // const obj = this;
    obj.id = UUID.UUID();
    obj.expanded = true;
    if (obj.category === MULKeyValueCategory.field) {
      obj.name = 'field' + (Math.random() * 1000000).toFixed(0).toString();
    } else {
      this.name = null;
    }
    return obj;
  }
}

export interface DataImage {
  description: string,
  link: string
}

export enum MULKeyValueCategory {
  field = 'Поле',
  object = 'Объект',
  array = 'Массив'
}

// MAIL TYPES
export interface MailFrom {
  address: string;
  name: string;
}

// DATATABLE META TYPES for check credentials
export enum DTMetaTypes {
  memory = 'memory',
  reference = 'reference',
  journal = 'journal',
  system = 'system'
}

export const BlockDialogLabels: any = {
  partners: {
    blocking: 'Заблокировать партнера',
    unblocking: 'Разблокировать партнера'
  }
};

// REQUEST METHODS
export enum RequestMethods {
  GET,
  POST,
  PUT,
  DELETE
}

export enum logEventTypes {
  blocking = 'blocking',
  unblocking = 'unblocking',
  files_check = 'files_check',
  file_add = 'file_add'
}

// Order-files section
export enum logMessages {
  сorrect = 'корректен',
  valid = 'годен только для заполнения заявки',
  invalid = 'не годен'
}


export const orderFilesPrimaryDocument = {
  name: '',
  code: '',
  file: {},
  primary: true
};

export const FileStatus: FileStatusType[] = [
  {
    id: 1,
    code: 'correct',
    title: 'корректен',
    description: 'полностью годен'
  },
  {
    id: 2,
    code: 'valid',
    title: 'годен',
    description: 'годен только для заполнения анкеты'
  },
  {
    id: 3,
    code: 'invalid',
    title: 'не годен',
    description: 'НЕ ГОДЕН'
  }
];

export interface FileStatusType {
  id: number,
  code: string,
  title: string,
  description: string
}
