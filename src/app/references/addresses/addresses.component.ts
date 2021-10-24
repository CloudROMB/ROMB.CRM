import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {DocumentObject} from '../../classes/data';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

import {DataTableView, defaultDataTableViewStates, DTViewTypes} from '../../classes/tables';

declare const $: any;

@Component({
  selector: 'romb-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  @ViewChild('address') addr: ElementRef;

  public dtView: DataTableView;
  public dtViewTypes = DTViewTypes;

  public obj: DocumentObject = {};

  constructor(private renderer: Renderer2,
              private shared: SharedService) {
    this.dtView = defaultDataTableViewStates;
    this.dtView.headerTitle = 'Адреса ФИАС';
    this.dtView.expandablePropery = 'source';
  }

  ngOnInit() {
    console.log('TABLE init:', this.dataTable);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }

  selectAddress(data) {
    // if (suggestion && suggestion.data && typeof suggestion.data === 'object') {
    //   // const event = new Event('data');
    //   // event.data = suggestion.data;
    //
    //   const data = suggestion.data;
    //   // console.log('data.stamp', data.stamp);
    //   data.update = data.stamp;
    //   delete data.stamp;
    //   delete data.name;
    //   delete data.code;
    //   delete data._id;
    //   // console.log('data.update', data.update);
    //
    //   const event = new CustomEvent('data', {detail: data});
    //   this.dispatchEvent(event);
    // } else {
    //   console.log('ERROR suggestion:', suggestion);
    // }

    if (!data) {
      console.log('ERROR address data', data);
      return false;
    } else {
        delete data.stamp;
        delete data.name;
        delete data.code;
        delete data._id;

      this.dataTable.item = this.shared.fillObject(data, this.dataTable.item);
      this.dataTable.item.valid = true;
      this.shared.updateInputs();
      // console.log('ITEM', this.dataTable.item);
      return true;
    }
  }
}
