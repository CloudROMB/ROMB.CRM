import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ElementRef
} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {SharedService} from '../../services/shared.service';
import {ApiResponse} from '../../classes/responses';
import {defaultComboListPropertyRequestStates, defaultComboListDocumentRequestStates} from '../../classes/comboboxes';
import {errorLog} from 'app/app.log';
import {MatSelect} from '@angular/material';
import {Subject} from 'rxjs';

@Component({
  selector: 'romb-combo-list',
  templateUrl: './combo-list.component.html',
  styleUrls: ['./combo-list.component.scss']
})
export class ComboListComponent implements OnInit, OnChanges {
  options: any;
  isLoading = false;
  isOpen = false;
  requestParams;
  optionsCount = 0;
  offset = 0;
  filterInputUpdate: Subject<any> = new Subject();

  @Input() label: string;
  @Input() limit = 5;
  @Input() clValue: any;
  @Input() mode = 'document';
  @Input() source: string;
  @Input() documentId: string;
  @Input() propValue: string;
  @Input() viewValues: Array<string> = ['name'];
  @Input() criteria;
  @Input() clDisabled: boolean;
  @Input() filter = true;
  @Input() pagination = true;
  @Input() OptionsLimit = 10;
  @Output() clValueChange: EventEmitter<any> = new EventEmitter;
  @ViewChild('comboList') comboInput: MatSelect;
  @ViewChild('filterInput') filterInput: ElementRef;

  constructor(
    private api: ApiService,
    private shared: SharedService) {
    this.filterInputUpdate.asObservable()
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(
        value => {
          this.onApplyFilter(value);
        }
      );
  }

  ngOnInit() {
    // if (this.mode === 'document' && !!!this.criteria) {
    //   throw Error('"criteria" property is required');
    // }
  }

  /**
   * Событие изменения свойств
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
      if (changes.clValue) {
          if (this.mode === 'document') {
              this.resetDocumentParams();
          } else if (this.mode === 'property') {
              this.resetPropertyParams();
          }
          if (this.filterInput && this.filterInput.nativeElement) {
            this.filterInput.nativeElement.value = '';
          }
      }
  }

  /**
   * Сбросить параметры и свойства для значений типа массив документов
   */
  resetPropertyParams() {
    this.requestParams = this.shared.copyObject(defaultComboListPropertyRequestStates);
    this.requestParams.limit = this.limit;
    this.options = [];
  }

  /**
   * Сбросить параметры и свойства для значений типа массив из свойства документа
   */
  resetDocumentParams() {
    this.requestParams = this.shared.copyObject(defaultComboListDocumentRequestStates);
    this.requestParams.limit = this.limit;
    this.requestParams.criteria = this.criteria || {};
  }

  /**
   * Событие выбора строки
   * @param event
   */
  onSelectItem(event) {
    if (this.mode === 'document') {
      const selectedRow = this.shared.copyObject(this.shared.getObjectToFieldStore(event, this.source));
      this.clValueChange.emit(selectedRow);
    } else if (this.mode === 'property') {
      this.clValueChange.emit(event);
    }
  }

  /**
   * Событие изменения раскрытия списка
   * @param event
   */
  async openedChange(event) {
    this.isOpen = event;
    this.isLoading = event;
    if (event) {
      this.getOptions();
      if (this.options) {
        this.isLoading = false;
      }
    }
  }

  /**
   * Склейка отображаемых значений
   * @param option
   */
  makeViewValue(option) {
    if (this.viewValues) {
      let values = '';
      this.viewValues.forEach(element => {
          switch (typeof option[element]) {
            case 'object':
              values += ' ' + (option[element].value || option[element].name || '');
              break;
              default:
              values += ' ' + (option[element] || '');
              break;
          }
      });
      return values;
    }
  }

  /**
   * Получить данные  для выбора
   */
  async getOptions() {
    this.isLoading = true;
    if (this.mode === 'document') { // Если значения это найденные документы
      const res: ApiResponse = await this.api.getList(this.source, this.requestParams);
      if (res && res.result === true && res.data) {
        this.isLoading = false;
        this.optionsCount = res.data.length;
        this.options = res.data.list;
      } else {
        errorLog(res.message);
      }
    } else if (this.mode === 'property') { // Если значения это массив - свойство в документе
      const res: ApiResponse = await this.api.getDocumentById(this.source, this.documentId);
      if (res && res.result === true) {
        this.isLoading = false;
        if (res.data && res.data[this.propValue]) {
          const result = await res.data[this.propValue].filter(element => {
            return element.active === true && this.checkFilter(element);
          });
          if (result) {
            this.options = result.slice(this.requestParams.offset, this.requestParams.offset + this.requestParams.limit);
            this.optionsCount = result.length;
          }
        } else {
          return [];
        }
      } else {
        errorLog(res.message);
      }
    }
  }

  /**
   * Обновление списка
   */
  onRefresh(): void {
    this.getOptions();
  }

  /**
   * Переход на первую страницу
   */
  toFirstPage(): void {
    if (this.requestParams.offset !== 0) {
      this.requestParams.offset = 0;
      this.getOptions();
    }
  }

  /**
   * Переход на предыдущую страницу
   */
  toPrevPage(): void {
    if (this.requestParams.offset - this.requestParams.limit >= 0) {
      this.requestParams.offset = this.requestParams.offset - this.requestParams.limit;
      this.getOptions();
    }
  }

  /**
   * Переход на следующую страницу
   */
  toNextPage(): void {
    if (this.requestParams.offset + this.requestParams.limit < this.optionsCount) {
      this.requestParams.offset = this.requestParams.limit + this.requestParams.offset;
      this.getOptions();
    }
  }

  /**
   * Переход на последнюю страницу
   */
  toLastPage(): void {
    if (this.requestParams.offset + this.requestParams.limit < this.optionsCount) {
      const lastPageOffset = this.optionsCount % this.requestParams.limit;
      this.requestParams.offset = this.optionsCount - lastPageOffset;
      this.getOptions();
    }
  }

  /**
   * Событие при символа в фильтр
   * @param e
   */
  onFilterFieldInput(e): void {
    const value = e.target && e.target.value;
    this.filterInputUpdate.next(value);
  }

  /**
   * Определение видимости лейбла "Загрузка"
   */
  loadingLabelisHidden(): boolean {
    if (this.comboInput && this.comboInput.panel) {
      return this.comboInput.panel.nativeElement.offsetWidth < 450;
    }
    return false;
  }

  /**
   * Применение фильтра
   * @param val
   */
  onApplyFilter(val): void {
    this.requestParams.filter = val;
    this.requestParams.offset = 0;
    this.getOptions();
  }

  /**
   * Фильтр
   * @param element
   */
  checkFilter(element): boolean {
    if (!this.requestParams.filter || (this.requestParams.filter && this.requestParams.filter.trim().lenght === 0)) {
      return true;
    }

    const filterValue = this.requestParams.filter;
    const regexp = new RegExp(filterValue, 'i');
    let result = false;
    this.viewValues.forEach(value => {
      let fieldValue;
      if (element[value]) {
        switch (typeof element[value]) {
          case 'object':
            fieldValue = element[value].value || element[value].name;
            break;
          default:
            fieldValue = element[value];
            break;
        }
        if (fieldValue.search(regexp) >= 0) {
          result = true;
        }
      }
    });
    return result;
  }
}
