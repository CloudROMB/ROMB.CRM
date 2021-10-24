import {Component, Inject, forwardRef, OnInit} from '@angular/core';
import {DataTableComponent} from './table';
import {DataTableLiteComponent} from './tablelite';
import {DTKeysFocus} from '../../classes/tables';

declare const $: any;

@Component({
  selector: 'romb-dt-pagination',
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.scss']
})
export class DataTablePaginationComponent implements OnInit {
  previousKeyState: DTKeysFocus;

  constructor(@Inject(forwardRef(() => DataTableLiteComponent)) public dataTable: DataTableLiteComponent) {
  }

  ngOnInit() {
  }

  pageBack() {
    this.dataTable.dtRequest.offset -= Math.min(this.dataTable.dtRequest.limit, this.dataTable.dtRequest.offset);
    this.dataTable.triggerReload();
  }

  pageForward() {
    this.dataTable.dtRequest.offset += this.dataTable.dtRequest.limit;
    this.dataTable.triggerReload();
  }

  pageFirst() {
    this.dataTable.dtRequest.offset = 0;
    this.dataTable.triggerReload();
  }

  pageLast() {
    this.dataTable.dtRequest.offset = (this.maxPage - 1) * this.dataTable.dtRequest.limit;
    this.dataTable.triggerReload();
  }

  get maxPage() {
    if (this.dataTable.dtRequest.limit) {
      return Math.ceil(this.dataTable.count / this.dataTable.dtRequest.limit);
    } else {
      return 1;
    }
  }

  get limit() {
    return this.dataTable.dtRequest.limit;
  }

  set limit(value) {
    this.dataTable.dtRequest.limit = Number(<any>value); // TODO better way to handle that value of number <input> is string?
    this.dataTable.triggerReload();
  }

  get page() {
    return this.dataTable.page;
  }

  set page(value) {
    this.dataTable.page = Number(<any>value);
  }

  limitInputKeyUp(e) {
    if (e.key === 'Enter') {
      console.log(e);
      this.limit = e.target.value;
      // this.dataTable.triggerReload();
      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.data-table-box');
        // console.log('Element:', el);
        el.focus();
        this.dataTable.moveSelectionFirst();
        console.log('DataTable', this.dataTable);
      }, 150);
    } else if (e.key === 'Escape') {
      e.target.value = this.limit;
      // this.dataTable.triggerReload();
      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.data-table-box');
        el.focus();
        // console.log(el);
        this.dataTable.moveSelectionFirst();
      }, 150);
    }
  }
  setLimitInputKeyState(e) {
    if (e.type === 'focus') {
      this.previousKeyState = this.dataTable.keyState;
      this.dataTable.initKeyStates(DTKeysFocus.pagination);
    } else if (e.type === 'blur') {
      this.limit = e.target.value;
      this.dataTable.initKeyStates(this.previousKeyState);
    }
  }

  pageInputKeyUp(e) {
    if (e.key === 'Enter') {
      console.log(e);
      this.page = e.target.value;
      // this.dataTable.triggerReload();
      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.data-table-box');
        // console.log('Element:', el);
        el.focus();
        this.dataTable.moveSelectionFirst();
        console.log('DataTable', this.dataTable);
      }, 150);
    } else if (e.key === 'Escape') {
      e.target.value = this.page;
      // this.dataTable.triggerReload();
      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.data-table-box');
        el.focus();
        // console.log(el);
        this.dataTable.moveSelectionFirst();
      }, 150);
    }
  }

  setPageInputKeyState(e) {
    if (e.type === 'focus') {
      this.previousKeyState = this.dataTable.keyState;
      this.dataTable.initKeyStates(DTKeysFocus.pagination);
    } else if (e.type === 'blur') {
      this.page = e.target.value;
      this.dataTable.initKeyStates(this.previousKeyState);
    }
  }
}
