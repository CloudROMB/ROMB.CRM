import {Component, Inject, forwardRef, HostListener, TemplateRef, OnInit, Input} from '@angular/core';
import {DTKeysFocus} from '../../classes/tables';
import {DataTableLiteComponent} from './tablelite';
import {SharedService} from '../../services/shared.service';

@Component({
  selector: 'romb-dt-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class DataTableHeaderComponent implements OnInit {
  @Input() headerTemplate: TemplateRef<any>;
  filter: string;
  previousKeyState: DTKeysFocus;

  @HostListener('document:click') onDocumentClick() {
    // расскоментировать, чтобы закрывался список фильтра по щелчку в любое место
    this.dataTable.dtView.columnSelectorOpened = false;
  }

  constructor(@Inject(forwardRef(() => DataTableLiteComponent)) public dataTable: DataTableLiteComponent,
              private shared: SharedService) {
  }

  ngOnInit() {
    // console.log('tpl:', this.headerTemplate);
  }

  setSearchFilter() {
    const changed = this.dataTable.dtRequest.filter !== this.filter;
    this.dataTable.dtRequest.filter = this.filter;
    if (changed) {
      this.dataTable.triggerReload();
    }
  }

  clearSearchFilter() {
    this.filter = null;
    const changed = this.dataTable.dtRequest.filter !== this.filter;
    this.dataTable.dtRequest.filter = this.filter;
    if (changed) {
      this.dataTable.triggerReload();
    }
  }

  searchKeyUp(e) {
    // console.log('filter', e, this.filter);
    if (e.key === 'Enter' && this.filter && this.filter.trim()) {
      this.setSearchFilter();

      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.data-table-box');
        el.focus();
        // console.log(el);
        this.dataTable.moveSelectionFirst();
      }, 150);
    } else if (e.key === 'Escape' && this.filter && this.filter.trim()) {
      this.filter = null;
      this.setSearchFilter();

      setTimeout(() => {
        const el = <HTMLElement>document.querySelector('.data-table-box');
        el.focus();
        console.log(el);
        this.dataTable.moveSelectionFirst();
      }, 150);
    }
  }

  setKeyState(event) {
    if (event.type === 'focus') {
      this.previousKeyState = this.dataTable.keyState;
      this.dataTable.initKeyStates(DTKeysFocus.filter);
    } else if (event.type === 'blur') {
      this.dataTable.initKeyStates(this.previousKeyState);
    }

    console.log('search', this.dataTable.keyState);
  }

  checkVisibility(cred: string, selectMode: boolean) {
    // console.log('++++++++', this.dataTable.metaType + '_' + cred,
    // selectMode === (this.dataTable.selectMode === true), selectMode, (this.dataTable.selectMode === true));

    return (this.shared.checkCredential(this.dataTable.metaType + '_' + cred)
      && selectMode === (this.dataTable.selectMode === true));
    // if (this.shared.checkCredential(this.dataTable.metaType + '_' + cred) && selectMode === (this.dataTable.selectMode === true)) {
    //   return this.shared.credentials.indexOf(cred) >= 0;
    // } else {
    //   return false;
    // }
  }
}
