import {
  AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2,
  ViewChild
} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

@Component({
  selector: 'romb-bank-partners',
  templateUrl: 'bank-partners.component.html',
  styleUrls: ['bank-partners.component.scss']
})

export class BankPartnersComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  public source = 'banks';
  private doc: any;
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;

  constructor(private shared: SharedService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    // console.log('ngOnInit', this.shared.doc);
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  ngOnDestroy() {
  }

  afterOpen(doc) {
    this.doc = doc;
  }

  beforeSave(doc) {
  }

  selectBank(obj) {
    const item = this.dataTable.item;
    if (!(obj && typeof obj === 'object')) {
      AlertsModule.notifyDangerMessage('Неверное значение Банка');
      return;
    }

    item.bank = obj;
    item.name = obj.selected;
    item.bik = obj.bic;

    this.shared.updateInputs();
  }
}
