import {Component, OnInit, ViewChild} from '@angular/core';
import {defaultStructureReference} from '../../classes/data';
import {DataTableRequestParams, defaultDataTableRequestStates, DTViewTypes} from '../../classes/tables';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {SharedService} from '../../services/shared.service';

@Component({
  selector: 'romb-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss']
})
export class ReferenceComponent implements OnInit {
  referenceSource = null;
  structureDoc = defaultStructureReference;
  dtRequest: DataTableRequestParams;
  dtViewTypes = DTViewTypes;
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;

  constructor(private shared: SharedService) {
    // параметры табличного документа
    this.dtRequest = shared.copyObject(defaultDataTableRequestStates);
    this.dtRequest.sortBy = '_id';
    this.dtRequest.sortAsc = false;

    this.referenceSource = 'metadata'
  }

  ngOnInit() {
  }
}
