import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {isArray, isBoolean} from 'util';
import {ApiResponse} from '../../classes/responses';
import {AlertsModule} from '../../alerts/alerts.module';
import swal from 'sweetalert2';
import {BlockDialogLabels} from '../../classes/types';
import {logEventTypes} from '../../classes/types';

@Component({
  selector: 'romb-blocking',
  templateUrl: './blocking.component.html',
  styleUrls: ['./blocking.component.scss']
})
export class BlockingComponent implements OnInit {

  @Input() item: any;
  @Input() source: string;
  @Input() isChanged;
  @Output() saveItemMethod = new EventEmitter();
  @Output() UpdateItemMethod = new EventEmitter();

  // @Output() isChanged = new EventEmitter()

  constructor(private api: ApiService) {
  }

  ngOnInit() {
  }

  /**
   * Нажатие на кнопку блокировать / разблокировать
   * @param item
   * @param toggle
   */
  async onPartnerBlock(item, toggle) {
    if (isBoolean(toggle)) {
      if (this.isChanged === true) {
        const saveChoise = await AlertsModule.saveChangesAlert('В документе есть изменения, сохранить их?');
        if (saveChoise === true) {
          await this.saveItemMethod.emit();
        }
      }
      const choise: any = await this.blockingMessage(toggle);
      if (choise && choise.result) {
        try {
          const params = {
            logEventType: toggle === true ? logEventTypes.blocking : logEventTypes.unblocking,
            objectID: item._id,
            description: toggle === true ? choise.comment : null
          };

          // Update item
          const updateItem = await this.updateItemActive(this.source, {_id: item._id, active: !toggle}, params);
          if (updateItem === true) {
            console.log('updated');
            this.UpdateItemMethod.emit(item._id);
          }
        } catch (error) {
          AlertsModule.notifyMessage('Не удалось сохранить карточку.');
        }
      }
    }
  }

  /**
   * Диалоговое окно при блокировке
   * @param toggle
   */
  blockingMessage(toggle) {
    console.log(this.source);
    return swal({
      title: toggle ? BlockDialogLabels[this.source].blocking : BlockDialogLabels[this.source].unblocking,
      html: toggle ? '<div class="form-group" style="margin: 20px 15px 0">' +
        '<input class="form-control" placeholder="Введите комментарий" id="block_comment">' +
        '</div>' : '',
      type: 'question',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-danger',
      cancelButtonClass: 'btn btn-success',
      confirmButtonText: 'Да',
      cancelButtonText: 'Нет',
      buttonsStyling: false

    }).then((x) => {
      let value = '';
      const elem: HTMLInputElement = <HTMLInputElement>document.getElementById('block_comment');
      if (elem) {
        value = elem.value;
      }
      const result: boolean = x.hasOwnProperty('value') && x.value === true;
      const data = {
        result: result,
        comment: value
      };
      return data;
    }).catch((err) => {
      return false;
    });
  }

  /**
   *
   * @param source
   * @param fields
   * @param logParams
   */
  async updateItemActive(source, fields, logParams) {
    const updateActiveRes = await this.api.updateDocument(source, fields);

    if (updateActiveRes) {
      if (updateActiveRes.result === true) {
        await this.api.addLogRecord(logParams);
        return true;
      } else {
        AlertsModule.notifyMessage('Не удалось сохранить карточку.');
        throw new Error(updateActiveRes.message);
      }
    }
  }
}
