import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {SharedService} from '../../services/shared.service';
import {
  CellType, DataTableColumn, DataTableRequestParams, DataTableView, defaultDataTableViewStates,
  DTViewTypes
} from '../../classes/tables';
import {AlertsModule} from '../../alerts/alerts.module';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';

@Component({
  selector: 'romb-system-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss']
})
export class TypesComponent implements AfterViewInit {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  public dtView: DataTableView;
  public dtRequest: DataTableRequestParams;
  public dtViewTypes = DTViewTypes;
  // public columns: DataTableColumn[] = [
  //   {
  //     property: '_id',
  //     header: 'ID',
  //     visible: true,
  //     type: CellType.string,
  //     templateCell: false
  //   },
  //   {
  //     property: 'name',
  //     header: 'Название',
  //     sortable: true,
  //     resizable: true,
  //     visible: true,
  //     cutSize: 50,
  //     type: CellType.string
  //   },
  //   {
  //     property: 'simple',
  //     header: 'Простой',
  //     sortable: true,
  //     resizable: false,
  //     visible: true,
  //     width: 80,
  //     type: CellType.icon
  //   }
  // ];

  public doc: {};

  constructor(private api: ApiService,
              private auth: AuthService,
              private shared: SharedService,
              private ref: ChangeDetectorRef) {

    this.dtView = defaultDataTableViewStates;
    this.dtView.expandablePropery = 'text';
    this.dtView.showIndexColumn = false;
    this.dtView.showSelectColumn = false;
  }

  ngAfterViewInit() {
    // console.log('dataTable', this.dataTable);
    // this.dataTable.reloadItems();
  }
}
