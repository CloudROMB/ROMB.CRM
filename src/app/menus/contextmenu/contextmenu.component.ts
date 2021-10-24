import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit,
  Output
} from '@angular/core';
import {ContextMenuItem, ContextMenuItemTypes, DTMetaTypes} from '../../classes/types';
import {SharedService} from '../../services/shared.service';
import {defaultContextMenu} from '../../classes/constants';
import {DTKeysFocus} from '../../classes/tables';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {AlertsModule} from '../../alerts/alerts.module';
import {debugLog} from '../../app.log';

declare const $: any;

@Component({
  selector: 'romb-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.scss']
})
export class ContextMenuComponent implements OnInit, AfterViewInit {
  @Input() menuClientClassName = 'data-table-box';

  @Input() source;
  menuEnabled = true;
  menuVisible = false;
  contextMenuItemTypes = ContextMenuItemTypes;

  items_: ContextMenuItem[];

  @Input() set items(val) {
    if (val) {
      this.items_ = this.shared.copyObject(val);
    } else {
      this.items_ = [];
    }
  }

  get items(): ContextMenuItem[] {
    return this.checkCredentials(this.items_);
  }

  private metaType: string;

  private contextMenuClassName = 'context-menu';
  private contextMenuItemClassName = 'context-menu__item';
  private contextMenuLinkClassName = 'context-menu__link';
  private contextMenuActive = 'context-menu--active';

  private taskItemInContext;

  private clickCoords;
  private clickCoordsX;
  private clickCoordsY;

  private menu;

  private menuWidth;
  private menuHeight;
  private menuPosition;
  private menuPositionX;
  private menuPositionY;

  private windowWidth;
  private windowHeight;

  @Output() selectMenuItem = new EventEmitter();

  constructor(private shared: SharedService,
              private auth: AuthService,
              private api: ApiService,
              private cdr: ChangeDetectorRef) {
    // console.log('Context menu created');

    api.getCredentials().then();
  }

  async ngOnInit() {
    if (this.source) {
      const meta = await this.api.getMeta(this.source)
        .catch(err => {
          console.error(err.message);
          AlertsModule.notifyDangerMessage('Меню context: Не удалось получить тип метаданных');
        });
      if (meta && meta.result && meta.data && meta.data.type) {
        this.metaType = meta.data.type.id;
      }
    }
    if (!this.metaType) {
      this.metaType = DTMetaTypes.reference;
    }

    // this.menu = $('#context-menu-' + this.source)[0];
    // this.menu = $('#context-menu')[0];
    // console.log('Context menu inited', this.menu, this.items);
  }

  ngAfterViewInit() {
    this.menu = $('#context-menu-' + this.source)[0];
    // TODO: добавить привязку к типу DTKeysFocus.menu
    // TODO: добавить методы открытия, закрытия меню и передача в источник
    // TODO: автоматически устанавливать фокус на первый элемент меню

    // this.menu = $('#context-menu')[0];
    // console.log('Context menu inited', this.menu);

    // if (!this.items || !this.items.length) {
    //   // console.log('SHARED CONTEXT');
    //   this.items = this.shared.copyObject(defaultContextMenu);
    //   this.cdr.detectChanges();
    // }
  }

  checkCredentials(items) {
    let menu = [];
    // console.log(this.shared.credentials);
    if (items && items instanceof Array) {
      let res = true;
      menu = items.filter(item => {
        switch (item.id) {
          case 'new':
            res = this.shared.checkCredential(`context_${this.metaType}_new`);
            break;
          case 'duplicate':
            res = this.shared.checkCredential(`context_${this.metaType}_duplicate`);
            break;
          case 'view':
            res = this.shared.checkCredential(`context_${this.metaType}_view`);
            break;
          case 'edit':
            res = this.shared.checkCredential(`context_${this.metaType}_edit`);
            break;
          case 'showDeleted':
            res = this.shared.checkCredential(`context_${this.metaType}_delete_view`);
            break;
          case 'delete':
            res = this.shared.checkCredential(`context_${this.metaType}_delete`);
            break;
          case 'apply':
            res = this.shared.checkCredential(`context_${this.metaType}_apply`);
            break;
          default:
            res = true;
            break;
        }
        // if (item.id) {
        //   console.log('checkCredential', item.id, res);
        // }
        return res;
      });
    }
    // console.log('checkCredential', menu);
    return menu;
  }

  // event handlers:
  menuItemSelected(menuItem, event) {
    // console.log('COMPONENT menuItemSelected:', menuItem, event);

    this.selectMenuItem.emit({item: menuItem, event: event});
    this.toggleMenuOff();
  }

  @HostListener('document:keyup', ['$event'])
  onDocumentKeyUp(event) {
    if (event.keyCode === 27) {
      this.toggleMenuOff();
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(e) {
    if (!this.menuEnabled) {
      return;
    }
    // console.log('Context menu Right clicked', this.source, this.menuEnabled);

    // console.log('Context menu Right clicked', e);
    this.taskItemInContext = SharedService.clickInsideElement(e, this.menuClientClassName);

    if (this.taskItemInContext) {
      e.preventDefault();
      this.toggleMenuOn();
      this.positionMenu(e);
    } else {
      this.taskItemInContext = null;
      this.toggleMenuOff();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e) {
    // console.log('Context menu Document clicked', e);
    const clickeElIsLink = SharedService.clickInsideElement(e, this.contextMenuLinkClassName);

    if (clickeElIsLink) {
      // e.preventDefault();
      // this.menuItemListener(clickeElIsLink);
    } else {
      const button = e.which || e.button;
      if (button === 1) {
        this.toggleMenuOff();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    this.toggleMenuOff();
  }

  /**
   * Listens for contextmenu events.
   */
  contextmenuListener(e) {
    this.taskItemInContext = SharedService.clickInsideElement(e, this.menuClientClassName);

    if (this.taskItemInContext) {
      e.preventDefault();
      this.toggleMenuOn();
      this.positionMenu(e);
    } else {
      this.taskItemInContext = null;
      this.toggleMenuOff();
    }
  }

  //  * Turns the custom context menu on.
  toggleMenuOn() {
    if (this.menuVisible !== true) {
      this.menuVisible = true;
    }
  }

  /**
   * Turns the custom context menu off.
   */
  toggleMenuOff() {
    if (this.menuVisible !== false) {
      this.menuVisible = false;
    }
  }

  //  * Positions the menu properly.
  //  * @param {Object} e The event
  positionMenu(e) {
    this.clickCoords = SharedService.getEventPosition(e);
    this.clickCoordsX = this.clickCoords.x;
    this.clickCoordsY = this.clickCoords.y;

    this.menuWidth = this.menu.offsetWidth + 4;
    this.menuHeight = this.menu.offsetHeight + 4;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    if ((this.windowWidth - this.clickCoordsX) < this.menuWidth) {
      this.menu.style.left = this.windowWidth - this.menuWidth + 'px';
    } else {
      this.menu.style.left = this.clickCoordsX + 'px';
    }

    if ((this.windowHeight - this.clickCoordsY) < this.menuHeight) {
      this.menu.style.top = this.windowHeight - this.menuHeight + 'px';
    } else {
      this.menu.style.top = this.clickCoordsY + 'px';
    }
  }

  /**
   * Dummy action function that logs an action when a menu item link is clicked
   *
   * @param {HTMLElement} link The link that was clicked
   */
  menuItemListener(link) {
    debugLog('Task ID - ' + this.taskItemInContext.getAttribute('data-id') + ', Task action - ' + link.getAttribute('data-action'));
    this.toggleMenuOff();
  }
}
