import {
  Component, Input, Inject, forwardRef, Output, EventEmitter, OnDestroy, OnInit
} from '@angular/core';
// import {DataTableComponent} from './table';
import {
  CellCallback,
  CellType,
  DataTableColumn,
  DataTableRequestParams,
  DataTableView,
  RowCallback
} from '../../classes/tables';
import {CutcellPipe} from '../../pipes/cutcell.pipe';

@Component({
  selector: '[romb-dt-row]',
  templateUrl: './row.html',
  styleUrls: ['./row.scss']
})
export class DataTableRowComponent implements OnInit, OnDestroy {
  cellsTypes = CellType;
  // FROM DATA-TABLE
  @Input() dtView: DataTableView;
  @Input() dtRequest: DataTableRequestParams;
  // Колонки таблицы
  @Input() columns: DataTableColumn[];
  @Output() rowClick = new EventEmitter();
  @Output() rowDoubleClick = new EventEmitter();
  @Output() cellClick = new EventEmitter();

  // @Input() dataTable: DataTableComponent;
  @Input() item: any;
  @Input() index: number;

  expanded: boolean;
  // _this = this; // FIXME is there no template keyword for this in angular 2?

  // row selection:
  @Output() selectedChange = new EventEmitter();
  private _selected: boolean;
  get selected() {
    return this._selected;
  }

  set selected(selected) {
    this._selected = selected;
    this.selectedChange.emit(this);
  }

  // other:
  get displayIndex() {
    if (this.dtView.showPagination) {
      return this.dtRequest.offset + this.index + 1;
    } else {
      return this.index + 1;
    }
  }

  getTooltip(expandable = false) {
    const view = this.dtView;

    if (!expandable && view.rowTooltip) {
      return view.rowTooltip(this.item, this, this.index);
    }

    if (!this.item) {
      return '';
    }

    // console.log('1', this.item.comment);
    if (view.expandablePropery && this.item[view.expandablePropery]) {
      // console.log('2');
      return this.item[view.expandablePropery];
    } else if (this.item.comment) {
      // console.log('3');
      return this.item.comment;
    } else if (this.item.descr) {
      // console.log('4');
      return this.item.descr;
    } else if (this.item.name) {
      // console.log('5');
      return this.item.name;
    } else if (this.item.code) {
      // console.log('6');
      return this.item.code;
    } else {
      // console.log('7');
      return this.item._id;
    }
  }

  getColumnTooltip(item: any, col: DataTableColumn) {
    const view = this.dtView;

    if (!(item && col)) {
      return '';
    }

    const v = item[col.property];
    if (v.descr) {
      return v.descr;
    } else if (v.comment) {
      return v.comment;
    } else if (v.name) {
      return v.name;
    } else if (v.code) {
      return v.code;
    } else if (v._id) {
      return v._id;
    } else {
      return '';
    }
  }

  ngOnInit() {
    // console.log('parent', this.dataTable);
  }

  constructor(
    // @Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent,
    private cutCellPipe: CutcellPipe) {
  }

  ngOnDestroy() {
    this.selected = false;
  }

  getCellClassObject(column: DataTableColumn) {
    const cls: string = <string>this.getCellClass(column);
    return {
      [cls]: true
    };
  }

  getCellClass(column: DataTableColumn): string {
    let style = 'data-column';
    if (!column.styleClass && column.property) {
      if (/^[a-zA-Z0-9_]+$/.test(column.property)) {
        style += ' column-' + column.property;
      } else {
        style += ' column-' + column.property.replace(/[^a-zA-Z0-9_]/g, '');
      }
    }

    // make align
    const align = column.align ? column.align : 'left';
    style += ' ' + align;

    return style;
  }

  getCellColor(column: DataTableColumn) {
    if (column && column.cellColors) {
      return (<CellCallback>column.cellColors)(this.item, this, column, this.index);
    } else {
      return null;
    }
  }

  canExpandRow() {
    if (!this.item) {
      return false;
    } else if (this.dtView.showExpandableRows) {
      return true;
    }
  }

  getRowColor() {
    if (this.dtView && this.dtView.rowColors) {
      return (<RowCallback>this.dtView.rowColors)(this.item, this, this.index);
    }
  }

  // MOUSE EVENTS
  cellClicked(val, col, e) {
    this.cellClick.emit({
      value: val,
      culumn: col,
      row: this,
      event: e
    });
  }

  rowClicked(e) {
    this.rowClick.emit({
      row: this,
      event: e
    });
  }

  rowDoubleClicked(e) {
    this.rowDoubleClick.emit({
      row: this,
      event: e
    });
  }

  // VIEW REPRESENTATIONS
  getReferencePresentation(col, value) {
    // console.log('---');
    if (!(col && col.type && col.type === CellType.reference)) {
      return '';
    }
    // console.log('---', col, value);

    if (!value || typeof value !== 'object') {
      return '<>';
    }

    let val;
    if (value.name) {
      val = value.name.trim();
    } else if (value.code) {
      val = value.code;
    } else if (value.id) {
      val = value.id;
    } else {
      val = '';
    }

    if (val && col.cutSize && typeof col.cutSize === 'number') {
      val = this.cutCellPipe.transform(val, col.cutSize);
    }
    // return '<' + val + '>';
    return val;
  }

  getObjectPresentation(col, item) {
    if (!(col && col.type && col.type === CellType.object)) {
      return '';
    }

    if (!(item && col.property && item[col.property])) {
      return '';
    }

    const value = item[col.property];
    // console.log('---', col, value);
    // console.log('---', col, value);
    if (!value || typeof value !== 'object') {
      return '<>';
    }
    console.log('---------', col.viewField);
    let val;
    if (col.viewField && value[col.viewField]) {
      val = value[col.viewField].trim();
    } else if (value.name) {
      val = value.name.trim();
    } else if (value.address) {
      val = value.address;
    } else if (value.code) {
      val = value.code;
    } else if (value.id) {
      val = value.id;
    } else {
      val = '';
    }

    if (val && col.cutSize && typeof col.cutSize === 'number') {
      val = this.cutCellPipe.transform(val, col.cutSize);
    }
    // return '<' + val + '>';
    return val;
  }

  columnCount() {
    let count = 0;
    if (this.columns) {
      count += this.dtView.showIndexColumn ? 1 : 0;
      count += this.dtView.showSelectColumn ? 1 : 0;
      count += this.dtView.showExpandableRows ? 1 : 0;
      this.columns.forEach(column => {
        count += column.visible ? 1 : 0;
      });
    }
    // console.timeEnd('answer time');
    return count;
  }
}
