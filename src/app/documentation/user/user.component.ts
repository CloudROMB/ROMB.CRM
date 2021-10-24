import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableRequestParams, defaultDataTableRequestStates} from '../../classes/tables';
import {SharedService} from '../../services/shared.service';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

@Component({
  selector: 'romb-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  dtRequest: DataTableRequestParams;

  constructor(private shared: SharedService) {
    // параметры табличного документа
    this.dtRequest = shared.copyObject(defaultDataTableRequestStates);
    this.dtRequest.sortBy = 'name';
    this.dtRequest.sortAsc = true;
    this.dtRequest.criteria = {
      type: 'user'
    };
  }

  ngOnInit() {
    this.dataTable.addRequestCriteria({
      type: 'user'
    });
  }

  beforeAddNew(dt) {
    // console.log(dt);
    dt.newItem = {
      type: 'user'
    };
  }
}
