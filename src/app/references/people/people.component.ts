import {AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  DataTableRequestParams,
  DataTableView,
  defaultDataTableRequestStates,
  defaultDataTableViewStates,
  DTViewTypes
} from '../../classes/tables';
import {SharedService} from '../../services/shared.service';
import {defaultStructurePeople} from '../../classes/data';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

declare const $: any;

@Component({
  selector: 'romb-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit, AfterViewInit, AfterViewChecked {
  structurePeople = defaultStructurePeople;
  dtRequest: DataTableRequestParams;
  dtViewTypes = DTViewTypes;
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;

  constructor(private shared: SharedService) {
    // параметры табличного документа
    this.dtRequest = shared.copyObject(defaultDataTableRequestStates);
    this.dtRequest.sortBy = 'name';
    this.dtRequest.sortAsc = true;
  }

  ngOnInit() {
    // console.log('ngOnInit', this.shared.doc);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit', this.shared.doc);
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  selectFIO(obj) {
    this.dataTable.item = this.shared.fillObject(obj, this.dataTable.item);
    this.dataTable.item.fullname = obj.unrestricted || obj.selected;
    this.dataTable.setChangeState();
    console.log('000', this.dataTable.item);
  }

  changeFiles(files) {
    this.dataTable.item.files = this.shared.copyObject(files);
    this.dataTable.setChangeState();
  }
}
