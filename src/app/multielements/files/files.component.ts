import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {defaultFilesLabels, FileCategory, MULFile, MULFiles, SuggestionTypes} from '../../classes/types';
import {UUID} from 'angular2-uuid';
import {ApiService} from '../../services/api.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {environment} from '../../../environments/environment';

declare const $: any;

@Component({
  selector: '[rombFiles]',
  templateUrl: './files.component.html',
  styleUrls: ['../multielements.scss']
})
export class FilesComponent implements OnInit {
  labels = defaultFilesLabels;
  suggType = SuggestionTypes;
  fileCategory = FileCategory;
  uploading = false;
  showPreview = false;
  private filesToUpload: File[];

  @Input() editMode = false;
  @Input() filesList: MULFiles[];
  @Input() categoryFilter: FileCategory = null;
  @Input() categoriesLimit: number = Object.keys(FileCategory).length; // 5 categories
  @Output() multiChange = new EventEmitter();
  @Output() startUpload = new EventEmitter();
  @Output() finishUpload = new EventEmitter();
  @Output() previewOpened = new EventEmitter();
  @Output() previewClosed = new EventEmitter();

  @HostListener('document:keyup', ['$event']) onDocumentKeyUp(event) {
    // console.log('source', this.source, 'keyCode', event.keyCode, 'keyState', this.keyState);

    switch (event.keyCode) {
      case 27:
        this.closePreviewClicked();
        return;
    }
  }

  fileKeys(): Array<string> {
    const keys = Object.keys(this.fileCategory);
    return keys;
  }

  fileVals(): Array<string> {
    const keys = Object.keys(this.fileCategory);
    // console.log('---', keys.map(el => keys[el]));
    return keys.map(el => Object(this.fileCategory)[el]);
  }

  constructor(private api: ApiService) {
    // console.log('editMode', this.editMode);
  }

  ngOnInit() {
    console.log('categoriesLimit', this.categoriesLimit);
  }

  handleFileInput(cat, files: FileList) {
    console.log('FILES:', files);
    if (!files.length) {
      return false;
    }

    this.filesToUpload = [];
    // console.log('FILES:', files);
    // let file;
    for (let i = 0; i < files.length; i++) {
      // file = files.item(i);
      // if (file.lastModifiedDate) {
      //   file.stamp = file.lastModifiedDate;
      //   delete file.lastModifiedDate;
      // }
      // if (file.name) {
      //   file.fileName = file.name;
      //   delete file.name;
      // }
      // if (file.size) {
      //   file.length = file.size;
      //   delete file.size;
      // }
      this.filesToUpload.push(files.item(i));
    }
    this.uploading = true;
    this.startUpload.emit();
    this.api.uploadFiles(this.filesToUpload)
      .then(answer => {
        this.uploading = false;
        if (answer.result && answer.data) {
          if (!cat.list) {
            cat.list = [];
          }
          answer.data.forEach(el => {
            cat.list.push(el);
          });
          this.finishUpload.emit(null);
        } else {
          this.finishUpload.emit('Файлы не добавлены');
          AlertsModule.notifyDangerMessage('Файлы не добавлены');
        }
        // console.log('UPLOAD:', answer);
      })
      .catch(err => {
        this.uploading = false;
        this.finishUpload.emit(err.message);
        console.log('ERROR UPLOAD:', err);
        AlertsModule.notifyDangerMessage(err.message);
      });
    // console.log('FILES:', this.filesToUpload);
  }

  addFileCategory(category) {
    if (!this.filesList) {
      this.filesList = [];
    }
    this.filesList.push({
      id: UUID.UUID(),
      category: category,
      list: []
    });

    // console.log('filesList', this.filesList);
    this.multiChange.emit(this.filesList);
  }

  removeCategory(category) {
    this.filesList = this.filesList.filter(el => {
      return (category.id !== el.id);
    });
    this.multiChange.emit(this.filesList);
  }

  addFile(category) {
    $('#addFile' + category.id).click();
    // $('#addFile' + category.id).change();

    // if (!category.list) {
    //   category.list = [];
    // }
    // category.list.push(<MULFile>{
    //   id: UUID.UUID(),
    //   fileName: '',
    //   description: '',
    //   fieldname: '',
    //   contentType: '',
    //   generatedFileName: '',
    //   length: null,
    //   stamp: null
    // });
    // this.multiChange.emit(this.filesList);
  }

  removeFile(cat, file) {
    cat.list = cat.list.filter(el => {
      return (file.id !== file.id);
    });
    this.multiChange.emit(this.filesList);
  }

  changeMultiValue() {
    this.multiChange.emit(this.filesList);
  }

  getFileLink(fname) {
    return environment.API_host + '/files/' + fname;
  }

  setPreviewLink(file: MULFile) {
    const link = this.getFileLink(file.generatedFileName);
    let embed;
    if (file.contentType.indexOf('image') >= 0) {
      embed = `<img src="${link}" alt="${file.fileName}" style="width: 100%; height: 100%">`;
    } else {
      embed = `<iframe id="previewLink" style="margin: 0; padding: 0; width: 100%; height: 100%;"
        src="https://docs.google.com/gview?url=${link}&embedded=true"></iframe>`;
    }
    $('#previewLinkBody').html(embed);


    // setTimeout(() => {
    //   // $('#previewLinkBody').modal({
    //   //   keyboard: true,
    //   //   handleUpdate: true,
    //   //   focus: true
    //   // }).modal('show');
    //   $('#previewLinkBody').modal('show');
    // }, 500);


    // $('#previewLinkBody').html(embed);
    // console.log('embed', embed);
    // $('#previewLink').attr('src', `http://docs.google.com/gview?url=${link}&embedded=true`);
  }

  showPreviewClicked(file) {
    this.showPreview = true;
    this.previewOpened.emit();

    setTimeout(() => {
      this.setPreviewLink(file);
    }, 300);
  }

  closePreviewClicked() {
    if (this.showPreview) {
      this.showPreview = false;
      this.previewClosed.emit();
    }
  }
}
