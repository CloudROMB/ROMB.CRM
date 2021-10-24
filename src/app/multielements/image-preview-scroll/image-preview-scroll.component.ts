import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  ViewChild,
  ElementRef,
  NgZone,
  OnDestroy
} from '@angular/core';
import {environment} from '../../../environments/environment';
import {SharedService} from '../../services/shared.service';
import {DataImage} from '../../classes/types';

@Component({
  selector: 'romb-image-preview-scroll',
  templateUrl: './image-preview-scroll.component.html',
  styleUrls: ['./image-preview-scroll.component.scss']
})
export class ImagePreviewScrollComponent implements OnInit, OnChanges, OnDestroy {
  @Input() height = 540;
  @Input() files;
  @ViewChild('selectedImageContainer') selectedImageContainer: ElementRef;
  @ViewChild('selectedImageEl') selectedImageEl: ElementRef;
  @ViewChild('thumbs') thumbsEl: ElementRef;
  thumbsScrollStep = 150;
  selectedImage;
  selectedImageHeight;
  zoomValues: Array<number> = [1, 2, 4, 6];
  currentZoom: number;
  scrolling = false;
  lastClientX;
  lastClientY;
  newScrollX;
  newScrollY;
  click: boolean;

  constructor(
    private shared: SharedService,
    private ngZone: NgZone
  ) {
  }

  ngOnInit() {
    this.selectedImageHeight = this.height;
    this.addEventListeners();
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    if (changes.files) {
      this.selectedImage = {};
    }
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

  /**
   * Добавление слушателей событий
   */
  addEventListeners() {
    this.ngZone.runOutsideAngular(() => {
      window.document.addEventListener('mousemove', this.onMousemove.bind(this));
      window.document.addEventListener('mouseup', this.onMouseup.bind(this));
    });
  }

  /**
   * Удаление слушателей событий
   */
  removeEventListeners() {
    window.document.removeEventListener('mousemove', this.onMousemove.bind(this));
    window.document.removeEventListener('mouseup', this.onMouseup.bind(this));
  }

  /**
   * Обработка события движения мыши
   * @param event
   */
  onMousemove(event: MouseEvent): void {
    this.onScroll(event);
  }

  /**
   * Отпускание левой кнопки мыши
   */
  onMouseup() {
    this.endScroll();
  }

  /**
   * Инициализация пролистывания
   * @param event
   */
  initScroll(event) {
    this.click = true;
    this.scrolling = true;
    this.lastClientX = event.clientX;
    this.lastClientY = event.clientY;
    event.preventDefault();
  }

  /**
   * пролистывание
   * @param e
   */
  onScroll(e) {
    if (this.lastClientX && this.lastClientY && this.scrolling) {
      this.click = false;
      this.selectedImageEl.nativeElement.classList.add('scrolling');
      this.selectedImageContainer.nativeElement.scrollLeft -= this.newScrollX = (-this.lastClientX + (this.lastClientX = e.clientX));
      this.selectedImageContainer.nativeElement.scrollTop -= this.newScrollY = (-this.lastClientY + (this.lastClientY = e.clientY));
    }
  }

  /**
   * окончание пролистывания
   */
  endScroll() {
    this.selectedImageEl.nativeElement.classList.remove('scrolling');
    this.scrolling = false;
  }

  /**
   * Создание src ссылки
   * @param fname
   */
  generateFileLink(fname) {
    if (fname) {
      return fname && environment.API_host + '/files/' + fname;
    }
    return '';
  }

  /**
   * События выбора изображения для просмотра
   * @param file
   */
  onSelectImage(file): void {
    this.selectedImage = this.shared.copyObject(file);
    this.selectedImageHeight = this.height;
    this.resetImageProps();
  }

  /**
   * Изменение масштаба изображения
   * @param event
   */
  changeZoom(event) {
    if (this.click) {
      const boundingClientRect = this.selectedImageContainer.nativeElement.getBoundingClientRect();
      const imageContainerWidth = boundingClientRect.width;
      const imageContainerHeight = boundingClientRect.height;
      const currentZoomIndex = this.zoomValues.indexOf(this.currentZoom);
      const nextZoomIndex = currentZoomIndex + 1;
      const nextZoom = this.zoomValues[nextZoomIndex];
      const rotationAngle = +this.selectedImageEl.nativeElement.style.transform.replace(/[^0-9]/gi, '') || 0;
      const offsetX = event.offsetX;
      const offsetY = event.offsetY;
      const layerX = event.layerX;
      const layerY = event.layerY;
      this.currentZoom = nextZoom ? nextZoom : 1;
      this.selectedImageHeight = this.height * this.currentZoom;
      let coordX, coordY;
      event.target.style.height = this.selectedImageHeight + 'px';

      const zoomFactor = nextZoom / this.zoomValues[currentZoomIndex];

      // Смещение offset из за смены "rotation"
      if (rotationAngle === 0) {
        coordX = (offsetX * zoomFactor) - (imageContainerWidth / 2);
        coordY = (offsetY * zoomFactor) - (imageContainerHeight / 2);
      } else {
        coordX = (layerX * zoomFactor) - (imageContainerWidth / 2);
        coordY = (layerY * zoomFactor) - (imageContainerHeight / 2);
      }

      this.selectedImageContainer.nativeElement.scrollTo(coordX || 0, coordY || 0);
    }
  }

  /**
   * Поворот изображения
   * @param direction
   */
  onRotateImage(direction): void {
    const imageElement = this.selectedImageContainer.nativeElement.getElementsByTagName('img')[0];
    if (imageElement) {
      const currentRotation = imageElement.style.transform.replace(/[^-0-9]/gi, '');
      let newDegrees;
      if (direction === 'right') {
        newDegrees = +currentRotation + 90;
      } else if (direction === 'left') {
        newDegrees = +currentRotation - 90;
      }

      if (newDegrees === 360 || newDegrees === -360) {
        newDegrees = 0;
      }
      imageElement.style.transform = 'rotate(' + newDegrees + 'deg)';
    }
  }

  /**
   * Печать изображения
   */
  onPrintImage(): void {
    if (this.selectedImage && this.selectedImage.generatedFileName) {
      let popupWin;
      popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
      <html>
      <head>
      <title>Print tab</title>
      <style>
      </style>
      </head>
      <body
      style="width: 100%; display: flex; align-items: center; justify-content: space-around;"
      onload="window.print();window.close()">
      <img src="${this.generateFileLink(this.selectedImage.generatedFileName)}"
      </body>
      </html>
      `);
      popupWin.document.close();
    }
  }

  /**
   * Сброс настроек фото
   */
  resetImageProps(): void {
    const image = this.selectedImageEl.nativeElement;
    image.style.transform = '';
    image.style.height = this.height + 'px';
    this.currentZoom = 1;
    this.selectedImageContainer.nativeElement.scrollTo(0, 0);
  }

  /**
   * Создание содержимого поля описания к изображению
   */
  getImageDescription(): string {
    if (this.selectedImage) {
      if (this.selectedImage.length) {
        if (this.selectedImage.description) {
          return this.selectedImage.description;
        } else {
          return 'Нет описания';
        }
      }
    }
    return 'Изображение не выбрано';
  }

  /**
   * Скроллинг thumbs
   * @param direction
   */
  onThumbsScroll(direction: string): void {
    const el = this.thumbsEl && this.thumbsEl.nativeElement;
    let scrollX;
    if (el) {
      if (direction === 'left') {
        scrollX = el.scrollLeft - this.thumbsScrollStep;
      } else if (direction === 'right') {
        scrollX = el.scrollLeft + this.thumbsScrollStep;
      }
      el.scrollTo(scrollX, 0);
    }
  }

  onRightClick(e) {
    return false;
  }
}
