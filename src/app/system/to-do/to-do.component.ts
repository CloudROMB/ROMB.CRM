import {AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {SharedService} from '../../services/shared.service';
import {
  CellType, DataTableColumn, DataTableRequestParams, DataTableView, defaultDataTableViewStates,
  DTViewTypes
} from '../../classes/tables';
import {DataTableComponent} from '../../data-table/components/table';
import {AlertsModule} from '../../alerts/alerts.module';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {taskDocument} from '../../classes/datamodels';
import {debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.scss']
})
export class ToDoComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;
  public dtView: DataTableView;
  public dtRequest: DataTableRequestParams;
  public dtViewTypes = DTViewTypes;

  public task = taskDocument;

  constructor(private api: ApiService,
              private shared: SharedService) {
    this.dtView = defaultDataTableViewStates;
    this.dtView.expandablePropery = 'result';
  }

  ngOnInit() {
    // console.log('TABLE init:', this.dataTable);
  }

  ngAfterViewInit() {
    // console.log('TABLE afterInit:', this.dataTable);
  }

  private rowClicked(event) {
    console.log('ROW:', event);
  }

  private cellClick(event) {
    console.log('cellClick:', event);
  }

  rowDoubleClicked(event) {
    if (event && event.row.item && event.row.item._id) {
      console.log('item', event.row.item);

      this.task = this.shared.fillObject(event.row.item);
      this.dtView.type = DTViewTypes.edit;
    } else {
      AlertsModule.notifyMessage('Возникла ошибка при открытии записи');
    }
  }

  private headerClicked($event) {
    console.log('HEADER:', $event);
  }

  exitField(event) {
    console.log(event);
  }

  beforeSave(event) {
    const doc = event.doc;

    if (doc.finished && !doc.done) {
      doc.done = new Date();
    }

    if (!doc.finished && doc.done) {
      doc.finished = true;
    }

    if (!doc.start && doc.done) {
      doc.start = doc.done;
    }

    this.shared.updateInputs();

    console.log('before SAVE', doc);
  }

  afterSave(doc) {
    console.log('afterSave', doc);
  }

  filterChange(e) {
    const el = $(e.target);

    switch (el.data('checked')) {
      // unchecked, going indeterminate
      case 0:
        el.data('checked', 1);
        el.prop('indeterminate', true);

        this.dataTable.removeRequestCriteria({
          finished: null
        });
        break;

      // indeterminate, going checked
      case 1:
        el.data('checked', 2);
        el.prop('indeterminate', false);
        el.prop('checked', true);

        this.dataTable.addRequestCriteria({
          finished: true
        });
        break;

      // checked, going unchecked
      default:
        el.data('checked', 0);
        el.prop('indeterminate', false);
        el.prop('checked', false);

        this.dataTable.addRequestCriteria({
          finished: {$ne: true}
        });
    }

    // if (e.target.checked) {
    //   this.dataTable.addRequestCriteria({
    //     finished: true
    //   });
    // } else {
    //   this.dataTable.addRequestCriteria({
    //     finished: {$ne: true}
    //   });
    // }
    // console.log('filter: ', e);
  }

  async beforeAddNew(table) {
    // the flag must set to TRUE in order for emitter to wait for the handler to complete
    table.waitForEvent = true;

    const nowDate = new Date();
    let m: string = (nowDate.getMonth() + 1).toString();
    if (m.length < 2) {
      m = '0' + m;
    }
    let d: string = (nowDate.getDate()).toString();
    if (d.length < 2) {
      d = '0' + d;
    }
    const hour = nowDate.getHours();
    const min = nowDate.getMinutes();
    const secs = nowDate.getSeconds();

    table.newItem = {
      code: m + d + '/' + ((hour * 60 * 60) + (min * 60) + secs)
    };

    // just for the test
    await this.shared.delay(500);

    // the flag must set to FALSE in order to release an emitter to continue it work
    table.waitForEvent = false;

    this.shared.updateInputs();
  }

  afterOpen(doc) {
    setTimeout(function () {
      $('#taskName').focus();
    }, 300);
  }
}
