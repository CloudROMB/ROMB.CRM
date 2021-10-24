import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {UUID} from 'angular2-uuid';
import {ApiService} from '../../services/api.service';
import {defaultFilesLabels, FileCategory, FileTypes, MULFile, MULFiles, SuggestionTypes} from '../../classes/types';
import {AlertsModule} from '../../alerts/alerts.module';
import {SharedService} from '../../services/shared.service';
import {archiveFileTypes, imageFileTypes, officeFileTypes, pdfFileTypes} from '../../classes/constants';
import {DTKeysFocus, DTKeysMemoryAction} from '../../classes/tables';
import {environment} from '../../../environments/environment';

declare const $: any;

@Component({
  selector: 'romb-fresh-files',
  templateUrl: './freshfiles.component.html',
  styleUrls: ['../multielements.scss']
})
export class FreshfilesComponent implements OnInit {
  labels = defaultFilesLabels;
  suggType = SuggestionTypes;
  uploading = false;

  categoriesExpanded = false;
  showPreview = false;
  previewFile: MULFile;
  previewList: MULFile[];
  previewIndex = -1;
  @Input() showTitle: boolean | null = true
  @Input() dangerComments = false;
  @Input() showHeaders = true;
  @Input() allowEdit = true; // запретить редактирование и добавление файлов
  @Input() editMode: boolean | null;
  @Input() showSaveButton = false;
  @Input() filesList: MULFiles[];
  @Input() categoryFilter: FileCategory = null;
  @Input() fileCategory = FileCategory;
  @Input() fileCheck: boolean | null = true;
  @Output() multiChange = new EventEmitter();
  @Output() startUpload = new EventEmitter();
  @Output() finishUpload = new EventEmitter();
  @Output() previewOpened = new EventEmitter();
  @Output() previewClosed = new EventEmitter();
  @Output() needSaveChanges = new EventEmitter();
  @Output() keyStateChanged = new EventEmitter();

  @HostListener('document:keyup', ['$event']) onDocumentKeyUp(event) {
    // console.log('keyCode', event.keyCode, 'ctrlKey', event.ctrlKey);

    switch (event.keyCode) {
      case 27:
        this.closePreviewClicked();
        return;
      // right
      case 39:
        if (this.showPreview) {
          this.nextPhoto();
        }
        return;
      // left
      case 37:
        if (this.showPreview) {
          this.prevPhoto();
        }
        return;
      // home
      case 36:
        if (this.showPreview) {
          this.firstPhoto();
        }
        return;
      // end
      case 35:
        if (this.showPreview) {
          this.lastPhoto();
        }
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

  constructor(private api: ApiService,
              private shared: SharedService) {
    // console.log('editMode', this.editMode);
  }

  ngOnInit() {
    this.initPanel();
  }

  clearPanel() {
    this.editMode = null;
    this.filesList = null;
  }

  initPanel(files?) {
    if (files) {
      this.filesList = files;
    }
    // console.log('----- 1', this.editMode);
    if (this.editMode === null || this.editMode === undefined) {
      if (!this.filesList || (this.filesList && !this.filesList.length)) {
        this.editMode = true;
        // console.log('----- 2');
      } else {
        let count = 0;

        this.filesList.forEach(file => {
          if (file.list && file.list.length) {
            count += file.list.length;
          }
        });

        this.editMode = (count === 0);
        // console.log('----- 22', count, this.editMode);
      }
    }

    if (!this.filesList) {
      this.filesList = [];
      // console.log('----- 3');
    }

    // console.log('----- 4');
    let found;
    for (const cat of this.fileVals()) {
      if (this.categoryFilter && this.categoryFilter !== cat) {
        continue;
      }

      found = false;
      this.filesList.forEach(el => {
        if (el.category === cat) {
          // console.log('4', el.category, cat);
          found = true;
        }
      });

      // console.log('5');
      if (!found) {
        this.addFileCategory(cat, true);
        // console.log('6');
      }
    }

    // for OLD FORMAT
    let other;
    this.filesList.forEach(el => {
      if (el.category === FileCategory.other) {
        other = el;
        if (!other.list) {
          other.list = [];
        }
      }
    });
    if (other) {
      this.filesList = this.filesList.filter(el => {
        if (!el.category) {
          console.log('el.category', el.category);
          const addel = this.shared.copyObject(el);
          addel.id = UUID.UUID();
          other.list.push(this.shared.copyObject(addel));
          return false;
        } else {
          return true;
        }
      });
    }

    // console.log('this.filesList', this.filesList);
  }

  handleFileInput(cat, files: FileList) {
    console.log('FILES:', files);
    if (!files.length) {
      return false;
    }

    const filesToUpload: File[] = [];
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
      filesToUpload.push(files.item(i));
    }

    this.uploading = true;
    this.startUpload.emit();
    this.api.uploadFiles(filesToUpload)
      .then(answer => {
        this.uploading = false;
        if (answer.result && answer.data) {
          if (!cat.list) {
            cat.list = [];
          }
          answer.data.forEach(el => {
            el.id = UUID.UUID();
            cat.list.push(el);
          });
          this.finishUpload.emit(null);
          this.multiChange.emit(this.filesList);
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
    // console.log('FILES:', filesToUpload);
  }

  addFileCategory(category, silent = false) {
    if (!this.filesList) {
      this.filesList = [];
    }
    const newCat = {
      id: UUID.UUID(),
      category: category,
      list: []
    };
    this.filesList.push(newCat);

    if (!silent) {
      setTimeout(() => {
        const el = document.querySelector('#cat-' + newCat.id);
        el.scrollIntoView(true);
      }, 100);

      // console.log('filesList', this.filesList);
      this.multiChange.emit(this.filesList);
    }
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

  async removeFile(cat, file) {
    this.keyStateChanged.emit({
      state: DTKeysFocus.swal,
      action: DTKeysMemoryAction.push
    });
    const choice = await AlertsModule.deleteAlert('Удалить файл из карточки?');
    this.keyStateChanged.emit({
      action: DTKeysMemoryAction.pop
    });

    if (choice === true) {
      cat.list = cat.list.filter(el => {
        return (file.id !== el.id);
      });
      this.multiChange.emit(this.filesList);
    }
  }

  changeMultiValue() {
    this.multiChange.emit(this.filesList);
  }

  getFileType(file): FileTypes {
    // console.log('***', file);
    let isImage = false;
    imageFileTypes.forEach(ext => {
      // console.log('***', file.contentType);
      if (file.contentType.indexOf(ext) >= 0) {
        isImage = true;
      }
    });
    if (isImage) {
      return FileTypes.image;
    }

    let isArchive = false;
    archiveFileTypes.forEach(ext => {
      if (file.contentType.indexOf(ext) >= 0) {
        isArchive = true;
      }
    });
    if (isArchive) {
      return FileTypes.archive;
    }

    let isOffice = false;
    officeFileTypes.forEach(ext => {
      if (file.contentType.indexOf(ext) >= 0) {
        isOffice = true;
      }
    });
    // console.log('***', file.generatedFileName, file.contentType);
    if (isOffice) {
      return FileTypes.office;
    }

    let isPDF = false;
    pdfFileTypes.forEach(ext => {
      if (file.contentType.indexOf(ext) >= 0) {
        isPDF = true;
      }
    });
    if (isPDF) {
      return FileTypes.pdf;
    }

    return FileTypes.other;
  }

  getPreviewFileLink(file: MULFile) {
    const ftype = this.getFileType(file);
    let link = '';

    switch (ftype) {
      case FileTypes.image:
        link = '/files/' + file.generatedFileName;
        break;
      case FileTypes.office:
        link = '/images/word100.png';
        break;
      case FileTypes.pdf:
        link = '/images/pdf100.png';
        break;
      case FileTypes.archive:
        link = '/images/archive100.png';
        break;
      default:
        link = '/images/unknown.png';
    }

    return environment.API_host + link;
  }

  getFileLink(file: MULFile) {
    return environment.API_host + '/files/' + file.generatedFileName;
  }

  setPreviewLink(file: MULFile) {
    const link = this.getFileLink(file);
    let embed;
    if (file.contentType.indexOf('image') >= 0) {
      // embed = `<img src="${link}" alt="${file.fileName}" style="width: min-content; height: auto;">`;
      embed = `<img src="${link}" alt="${file.fileName}" style="width: 100%; height: auto;">`;
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

  showPreviewClicked(list: MULFile[], file: MULFile) {
    // console.time('file index');
    this.previewList = list;
    this.previewFile = file;

    list.forEach((el, index) => {
      if (el.id === file.id) {
        // console.log('file index:', index);
        this.previewIndex = index;
      }
    });
    // console.timeEnd('file index');

    this.showPreview = true;
    this.previewOpened.emit();

    setTimeout(() => {
      this.setPreviewLink(file);
    }, 100);

    setTimeout(() => {
      const img = $('.preview-frame img');
      if (img && img.length) {
        img[0].focus();
        img[0].click();
        // console.log(img[0]);
      }
    }, 500);
  }

  closePreviewClicked() {
    if (this.showPreview) {
      this.previewList = null;
      this.previewFile = null;
      this.previewIndex = -1;

      this.showPreview = false;
      this.previewClosed.emit();
    }
  }

  firstPhoto() {
    if (this.previewList && this.previewIndex > 0) {
      this.showPreviewClicked(this.previewList, this.previewList[0]);
    }
  }

  lastPhoto() {
    if (this.previewList && this.previewIndex < this.previewList.length - 1) {
      this.showPreviewClicked(this.previewList, this.previewList[this.previewList.length - 1]);
    }
  }

  prevPhoto() {
    if (this.previewList && this.previewIndex > 0) {
      this.showPreviewClicked(this.previewList, this.previewList[this.previewIndex - 1]);
    }
  }

  nextPhoto() {
    if (this.previewList && this.previewIndex < this.previewList.length - 1) {
      this.showPreviewClicked(this.previewList, this.previewList[this.previewIndex + 1]);
    }
  }

  convertBytesToMB(bytes) {
    if (bytes && typeof bytes === 'number') {
      try {
        return (bytes / 1024 / 1024).toFixed(2) + ' Mb';
      } catch (e) {
        return bytes + ' Bytes';
      }
    } else {
      return '0';
    }
  }

  async changeFileCategory(cat: MULFiles, file: MULFile, fileCategory) {
    const fileListBefore = this.shared.copyObject(this.filesList);
    const newFileCat = fileCategory.value;

    if (!cat) {
      return false;
    }

    // вопрос об изменении категории карточки
    this.keyStateChanged.emit({
      state: DTKeysFocus.swal,
      action: DTKeysMemoryAction.push
    });
    const choice = await AlertsModule.changeStatusAlert('Изменить категорию файла?', `Новая категория "${newFileCat}"`);
    this.keyStateChanged.emit({
      action: DTKeysMemoryAction.pop
    });

    if (choice !== true) {
      fileCategory.value = cat.category;
      return false;
    }

    if (cat.category !== newFileCat) {
      if (cat.list && cat.list.length) {
        let pos = -1;
        cat.list.forEach((fil, i, arr) => {
          if (fil.id === file.id) {
            pos = i;
          }
        });

        if (pos >= 0 && this.filesList && this.filesList.length) {
          let found = null;
          this.filesList.forEach((cats, c, carr) => {
            if (cats.category === newFileCat) {
              found = cats;
            }
          });

          if (found) {
            found.list.push(file);
          } else {
            this.filesList.push({
              id: UUID.UUID(),
              category: <FileCategory>newFileCat,
              list: [file]
            });
          }

          cat.list = cat.list.filter(fil => {
            return (file.id !== fil.id);
          });
        }
      }
    }
    // console.log('---', cat, file, newFileCat);
    console.log('---', this.filesList);

    if (!this.shared.compareObjects(fileListBefore, this.filesList)) {
      this.multiChange.emit(this.filesList);
    }
  }

  needSaveChangesCkicked() {
    this.needSaveChanges.emit(this.filesList);
  }

  checkCredential(cred) {
    return this.shared.checkCredential(cred);
  }

  changeFileCorrect(file) {
    console.log(file);
  }

  expandCategories() {
    if (this.categoriesExpanded) {
      $('.file-category').removeClass('in');
    } else {
      $('.file-category').addClass('in');
    }
    this.categoriesExpanded = !this.categoriesExpanded;
  }

  /**
   * Возможно ли скачивание / удаление / просмотр файла
   * @param {Object} file
   */
  canGetFile(file) {
    const isPartner = this.shared.checkCredential('user_partner') && !this.shared.checkCredential('system_user_admin');
    return !isPartner || (isPartner && !file.correct);
  }
}
