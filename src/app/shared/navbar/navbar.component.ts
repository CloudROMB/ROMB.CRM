import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {SharedService} from '../../services/shared.service';
import {ApiService} from '../../services/api.service';
import {mainMenuTypes, MenuItem} from '../../classes/routes';
import {AuthService} from '../../services/auth.service';
import {debugLog} from '../../app.log';
import {Subscription} from 'rxjs';
import {User} from '../../classes/types';

declare const $: any;

@Component({
  selector: 'romb-navbar',
  templateUrl: 'navbar.component.html',
  providers: []
})
export class NavbarComponent implements OnInit, OnDestroy {
  public menuItems: MenuItem[];
  public user: User;
  private eventsSubscription: Subscription;
  location: Location;
  events: any[];
  calcIsOpen = false;
  private nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;

  @ViewChild('romb-navbar') button: any;

  constructor(private location_: Location,
              private renderer: Renderer2,
              private element: ElementRef,
              private api: ApiService,
              private auth: AuthService,
              private cdr: ChangeDetectorRef,
              private shared: SharedService) {
    this.location = location_;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
  }

  async ngOnInit() {
    this.menuItems = await this.api.getMainMenuStructure({
      type: mainMenuTypes.user
    });
    this.menuItems = this.menuItems.filter(item => {
      if (item.active === true && item.children && item.children.length) {
        item.children = item.children.filter(sub => {
          return (sub.active === true);
        });
      }
      return (item.active === true);
    });

    this.eventsSubscription = this.api.getNewEvents().subscribe(data => {
      this.events = <any[]>data;
    });

    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();

    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

    this.shared.sidebarInitialize();
    this.user = this.auth.loadUserFromStorage(false);

    // this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.eventsSubscription.unsubscribe();
  }

  getDashboardRoute() {
    let droute = '/dashboard';
    if (this.user && this.user.roles && this.user.roles.length) {
      this.user.roles.forEach(role => {
        if (role && role.code) {
          if (role.code.toLowerCase().indexOf('partner') >= 0) {
            droute = '/dashboardp';
          }
        }
      });
    }
    return droute;
  }

  onResize(event) {
    return !($(window).width() > 991);
  }

  sidebarOpenClose() {
    console.log('sidebarOpenClose');
    this.shared.sidebarOpenClose();
  };

  sidebarMinMax() {
    console.log('sidebarMinMax');
    this.shared.sidebarMinMaximize();
  };

  getTitle() {
    let titlee: any = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.replace('#/', '/'); // fucking LocationStrategy and UseHash
    if (this.menuItems) {
      for (let i = 0; i < this.menuItems.length; i++) {
        if (this.menuItems[i].type === 'link' && this.menuItems[i].path === titlee) {
          return this.menuItems[i].title;
        } else if (this.menuItems[i].type === 'sub') {
          for (let j = 0; j < this.menuItems[i].children.length; j++) {
            const subtitle = this.menuItems[i].path + '/' + this.menuItems[i].children[j].path;
            if (subtitle === titlee) {
              return this.menuItems[i].children[j].title;
            }
          }
        }
      }
    }
    return 'FRESHCREDIT CRM';
  }

  getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }

  logOut() {
    return this.shared.queryLogOut();
  }

  showCreditCalculator() {
    if (this.calcIsOpen === false) {
      this.calcIsOpen = true;
    }
    debugLog('calcIsOpen:', this.calcIsOpen);
  }

  closeCreditCalculator() {
    this.calcIsOpen = false;
    debugLog('calcIsOpen:', this.calcIsOpen);
  }

  getEventsCount(): number {
    if (Array.isArray(this.events)) {
      return this.events.length;
    } else {
      return 0;
    }
  }
}
