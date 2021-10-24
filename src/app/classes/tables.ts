import {DataTableRowComponent} from '../data-table/components/row';

export type LiteRowCallback = (row: DataTableRow) => string;
export type LiteCellCallback = (row: DataTableRow, column: DataTableColumn) => string;

// export type RowCallback = (item: any, row: DataTableRowComponent, index: number) => string;
export type RowCallback = (item: any, row: DataTableRow, index: number) => string;
export type CellCallback = (item: any, row: DataTableRowComponent, column: DataTableColumn, index: number) => string;
export type HeaderCallback = (column: DataTableColumn) => string;

// типы отображения таблицы
export enum DTViewTypes {
  list = 'list', // список
  new = 'newItem', // форма нового документа
  edit = 'editItem', // форма редактирования документа
  view = 'viewCard' // форма просмотра карточки документа
}

// Событие DataTable - keyStateChanged
export interface DTKeyStateChangedEvent {
  state: DTKeysFocus;
  action: DTKeysMemoryAction;
}

// Тип события изменения статуса фокуса клавиатуры
export enum DTKeysMemoryAction {
  none,
  push,
  pop
}

// Типы отображения таблицы
export enum DTKeysFocus {
  none = 'none', // список таблицы
  list = 'list', // список таблицы
  card = 'card', // карточка
  modal = 'modal', // модальный список, вызванный из карточки
  swal = 'swal', // модальный вопрос
  preview = 'preview', // модальное окно предпросмотра файла
  view = 'view', // карточка просмотра заявки
  menu = 'menu', // модальный вопрос
  filter = 'filter', // поле поиска
  pagination = 'pagination' // элемент пагинации
}

// export interface DataTableTranslations {
//   headerAddNew: string;
//   headerViewDoc: string;
//   headerSelectDoc: string;
//   headerCancelSelect: string;
//   headerRefresh: string;
//   headerColumns: string;
//   headerSearch: string;
//   headerClearSearch: string;
//   indexColumnHeader: string;
//   showSelectColumn: string;
//   expandColumn: string;
//   paginationLimit: string;
//   paginationRange: string;
//   paginationPage: string;
//   paginationBegin: string;
//   paginationEnd: string;
//   paginationNext: string;
//   paginationPrev: string;
// }

// инициализация отображения списка табличного документа по умолчанию
export let defaultDataTableViewStates = <DataTableView>{
  showHeader: true,
  headerTitle: '',
  newCardHeader: 'Новая карточка',
  editCardHeader: 'Редактирование карточки',
  viewCardHeader: 'Просмотр карточки',
  columns: [],
  items: [],
  count: 0,
  indexColumnHeader: '#',
  type: DTViewTypes.list,
  selectOnRowClick: true,
  autoReload: true,
  multiSelect: false,
  showExpandableRows: false,
  expandablePropery: 'comment',
  rowTooltip: null,
  rowColors: null,
  showIndexColumn: false,
  showSelectColumn: false,
  showPagination: true,
  showSubstituteRows: false,
  showReloading: false,
  columnSelectorOpened: false,
  selectMode: false
};

// инициализация параметров запросов табличного документа к API
export let defaultDataTableRequestStates = <DataTableRequestParams> {
  deleted: false,
  offset: 0,
  limit: 15,
  filter: null,
  sortAsc: false,
  sortBy: 'stamp',
  criteria: null
};

// deleted — if == null -- {$ne: true}
// criteria — object for $match aggregation request
// cutFields — return full set of fields, or only "code, name, id, source" (default)
export interface DataTableRequestParams {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortAsc?: boolean | null;
  filter?: string | null;
  deleted?: boolean | null;
  excludeID?: string;
  criteria?: any;
  cutFields?: boolean | null;
}

export enum CellType {
  string = 'string',
  text = 'text',
  date = 'date',
  dateTime = 'datetime',
  currency = 'currency',
  number = 'number',
  html = 'html',
  icon = 'icon',
  boolean = 'boolean',
  object = 'object',
  reference = 'reference',
  document = 'document'
}

export interface DataTableView {
  type: DTViewTypes;
  showHeader?: boolean;
  headerTitle?: string;
  newCardHeader: string;
  editCardHeader: string;
  viewCardHeader: string;
  indexColumnHeader?: string;
  showIndexColumn?: boolean;
  rowTooltip?: RowCallback;
  rowColors?: RowCallback;
  rowLiteTooltip?: LiteRowCallback;
  rowLiteColors?: LiteRowCallback;
  selectOnRowClick?: boolean;
  showSelectColumn?: boolean;
  autoReload?: boolean;
  showPagination?: boolean;
  multiSelect?: boolean;
  showReloading?: boolean;
  showSubstituteRows?: boolean;
  showExpandableRows?: boolean;
  columnSelectorOpened?: boolean;
  expandablePropery?: string;
}

export interface DataTableRow {
  index: number;
  item: any;
  expanded: boolean;
  selected: boolean;
  columns: DataTableColumn[],
  showIndex?: number,
  title?: string;
  rowColor?: string;
}

export interface DataTableColumn {
  property: string;
  header?: string | null;
  headerIcon?: string | null;
  sortable?: boolean | null;
  resizable?: boolean | null;
  listField?: boolean | null;
  visible?: boolean;
  visibleSelect?: boolean | null;
  cutSize?: number | null;
  type?: CellType | null;
  viewField?: string;
  trueIcon?: string | null;
  falseIcon?: string | null;
  templateCell?: boolean;
  cellColors?: any | null;
  templateHeader?: boolean | null;
  headerColor?: string | null;
  align?: string | null;
  width?: number | string | null;
  styleClass?: string | null;
  icon?: string;
  index?: number;
  ngClass?: any;
  class?: string;
  color?: string;
  backColor?: string;
  title?: string;
  value?: any;
}

export let MetaCache: DataTableColumn[][];
