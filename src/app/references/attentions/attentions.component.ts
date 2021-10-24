import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {DataTableComponent} from '../../data-table/components/table';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

@Component({
  selector: 'romb-attentions',
  templateUrl: './attentions.component.html',
  styleUrls: ['./attentions.component.scss']
})
export class AttentionsComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  public source = 'attentions';
  public struct = {
    text: '',
    active: false
  };

  constructor(private shared: SharedService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  ngOnDestroy() {
  }

  afterOpen(doc) {
  }

  beforeSave(doc) {
  }

  updateHTMLView(item) {
    if (item) {
      const el = <HTMLElement>document.querySelector('#attentionView');
      if (el) {
        const header = `<h3 style="color: darkred;">${item.name}</h3>`;
        // el.innerHTML = header + `<div>${item.text}</div>`;
        return header + `<div>${item.text}</div>`;
      }
    } else {

    }
  }
}
