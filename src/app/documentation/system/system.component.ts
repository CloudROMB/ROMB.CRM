import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableRequestParams, defaultDataTableRequestStates} from '../../classes/tables';
import {SharedService} from '../../services/shared.service';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

@Component({
  selector: 'romb-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  dtRequest: DataTableRequestParams;

  constructor(private shared: SharedService) {
    // параметры табличного документа
    this.dtRequest = shared.copyObject(defaultDataTableRequestStates);
    this.dtRequest.sortBy = 'name';
    this.dtRequest.sortAsc = true;
    this.dtRequest.criteria = {
      type: 'system'
    };
  }

  ngOnInit() {
    this.dataTable.addRequestCriteria({
      type: 'system'
    });
  }

  beforeAddNew(dt) {
    dt.newItem = {
      type: 'system'
    };
  }
}
