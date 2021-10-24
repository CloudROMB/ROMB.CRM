import { Component, OnInit, Input, Output, ViewChild, ViewChildren, QueryList, EventEmitter } from '@angular/core';
import {ApiService} from '../../services/api.service';
import {SharedService} from '../../services/shared.service';
import {environment} from '../../../environments/environment';
import {MatExpansionPanel} from '@angular/material'
import {ApiResponse} from '../../classes/responses';
import {AlertsModule} from '../../alerts/alerts.module';
import {FileStatus, FileStatusType, logMessages, logEventTypes} from '../../classes/types';

@Component({
  selector: 'romb-files-control',
  templateUrl: './files-control.component.html',
  styleUrls: ['./files-control.component.scss']
})
export class FilesControlComponent implements OnInit {
  dragBackground;
  dragData;
  prevEventDragZone;
  isFilesPanelOpened: boolean | null;
  fileStatus: FileStatusType[] = FileStatus;
  mode = 'files';
  filesCheckLogs;
  @Input() files;
  @Input() documentId;
  @Output() filesChange: EventEmitter<any> = new EventEmitter;
  @Output() filesChangeError: EventEmitter<any> = new EventEmitter;
  @ViewChildren(MatExpansionPanel) panel: QueryList<any>;
  constructor(
    private api: ApiService,
    private shared: SharedService
  ) { }

  ngOnInit() {
    this.createDragImage();
  }

  generateFileLink(fname) {
    if (fname) {
      return fname && environment.API_host + '/files/' + fname;
    }
  }

  /**
   *
   * @param e
   */
  onFileDrag(e, f) {
    if (e && e.target) {
     e.dataTransfer.setDragImage(this.dragBackground, 0, 0);
     this.dragData = f;
    }
  }

  /**
   *
   * @param ev
   */
  onAllowDrop(e) {
    e.preventDefault();
  }

  onDragEnter(e) {
    e.preventDefault();
    if (e && e.target) {
      const dragEnterZone = this.getDropZoneElement(e.target);
      if (!this.prevEventDragZone) {
        this.prevEventDragZone = dragEnterZone;
      }
      if (this.prevEventDragZone !== dragEnterZone) {
        this.prevEventDragZone.classList.remove('drop-zone');
        dragEnterZone.classList.add('drop-zone');
        this.prevEventDragZone = dragEnterZone;
      }
    }
  }

  /**
   *
   * @param e
   */
  async onDrop(e, cat) {
    e.preventDefault();
    if (cat.list.indexOf(this.dragData) < 0) {
      try {
        this.prevEventDragZone.classList.remove('drop-zone');
        this.prevEventDragZone = null;
        await this.changeFileCategory(cat);
        this.filesChange.emit(this.files);
      } catch (error) {
        AlertsModule.notifyDangerMessage('Не удалось сменить категорию');
        throw new Error(error);
      }
    }
  }

  onDragEnd(e) {
    this.prevEventDragZone.classList.remove('drop-zone');
    this.prevEventDragZone = null;
  }

  getDraggingElement(target) {
    const dragElem = target.classList.contains('dragdrop-elem') ? target : target.closest('.dragdrop-elem');
    return dragElem;
  }

  getDropZoneElement(target) {
    const dropZone = target.classList.contains('dragdrop-target') ? target : target.closest('.dragdrop-target');
    return dropZone;
  }

  createDragImage() {
    const elem = document.createElement('i');
    elem.classList.add('material-icons');
    elem.innerHTML = 'playlist_add';
    elem.style.display = 'hidden';
    this.dragBackground = document.body.appendChild(elem);
  }

  expandAll() {
    this.panel.forEach(el => {
      el.open();
    });
    this.isFilesPanelOpened = true;
  }

  closeAll() {
    this.panel.forEach(el => {
      el.close();
    });
    this.isFilesPanelOpened = false;
  }

  /**
   * Смена категории файла
   * @param cat
   */
  changeFileCategory(cat) {
    const droppedFile = this.dragData;
    const fileId = droppedFile.id;

    // Удаление из старой категории
    this.files.forEach(catItem => {
      const index = catItem.list.indexOf(droppedFile);
      if (catItem.list && index >= 0) {
       catItem.list.splice(index, 1);
      }
    });

    // Вставка в новую категорию
    cat.list.push(droppedFile);
  }

  async onFileStatusChange(e, file) {
    const choice = await AlertsModule.saveAlert('Вы уверены?');
      if (choice === true) {
        const item = e.value;
        if (item) {
          try {
            file.status = item;
            const itemId = this.documentId;
            const logEvent = logEventTypes.files_check;
            const message = 'Документ с пометкой "' + file.description + '" ' + logMessages[item.code];
            const params = {
              logEventType: logEvent,
              objectID: itemId,
              description: message
            };
            await this.filesChange.emit(this.files);
            await this.api.addLogRecord(params);
          } catch (error) {
            this.filesChangeError.emit();
            throw new Error(error);
          }
        } else {}
      } else {
        e.source.checked = false;
        return;
      }
  }
  /**
   * Раскрытие истории комментариев проверки файлов
   *
   */
  onFileCheckLogsOpen() {
    if (this.documentId) {
      this.getFilesCheckLog(this.documentId);
    }
  }

  /**
   * Получить историю комментариев проверки файлов
   */
  async getFilesCheckLog(documentId) {
    if (documentId) {
      const logEventType = logEventTypes.files_check;
      const params = {
        objectID: documentId,
        logEventType: logEventType
      }
      try {
        const res: ApiResponse = await <Promise<ApiResponse>>this.api.getLogList({}, params)
        if (res && res.result === true) {
          this.filesCheckLogs = res.data.list;
        }
      } catch (error) {
        AlertsModule.notifyDangerMessage('Не удалось получить историю проверки файлов');
        throw new Error(error);
      }
    }
  }
  compareObject(obj1, obj2) {
    return this.shared.compareObjects(obj1, obj2)
  }
}
