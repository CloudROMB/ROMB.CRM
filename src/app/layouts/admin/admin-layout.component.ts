import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {NavItem, NavItemType} from '../../md/md.module';
import {Subscription} from 'rxjs/Subscription';
import {Location, PopStateEvent} from '@angular/common';
import 'rxjs/add/operator/filter';
import {NavbarComponent} from '../../shared/navbar/navbar.component';
import PerfectScrollbar from 'perfect-scrollbar';
import {AuthService} from '../../services/auth.service';
import {SharedService} from '../../services/shared.service';
import {ApiService} from '../../services/api.service';
import {debugLog} from '../../app.log';
import {SocketService} from '../../services/socket.service';

declare const $: any;

@Component({
  selector: 'romb-admin-layout',
  templateUrl: './admin-layout.component.html'
})

export class AdminLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  public navItems: NavItem[];
  private _router: Subscription;
  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];
  private url: string;
  private events;

  @ViewChild('sidebar') sidebar: any;
  // @ViewChild(SidebarComponent) sidebar: SidebarComponent;
  @ViewChild(NavbarComponent) navbar: NavbarComponent;

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    // console.log('Wheel Chrome');
    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
    // console.log('Wheel Firefox');
    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
    // console.log('Wheel IE');
    this.mouseWheelFunc(event);
  }

  mouseWheelFunc(e) {
    // console.log('WHEEL', e);
    const event = window.event || e; // old IE support
    const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    if (delta > 0) {
      // this.mouseWheelUp.emit(event);
      // $('.main-panel').scrollTo(0, delta);
      window.scrollBy(-delta * 40, 0);
    } else if (delta < 0) {
      // this.mouseWheelDown.emit(event);
      // $('.main-panel').scrollTo(0, delta);
      window.scrollBy(-delta * 40, 0);
    }
    // for IE
    // event.returnValue = false;
    // for Chrome and Firefox
    // if (event.preventDefault) {
    //   event.preventDefault();
    // }
  }

  constructor(private router: Router,
              private location: Location,
              public ws: SocketService,
              private shared: SharedService,
              private auth: AuthService) {
  }

  ngOnInit() {
    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');

    this.location.subscribe((ev: PopStateEvent) => {
      debugLog('lastPoppedUrl', ev.url);
      this.lastPoppedUrl = ev.url;
    });

    this.events = this.router.events.subscribe((event: any) => {
      if (!this.auth.loggedIn()) {
        return false;
      }
      // debugLog('+++ router.events', event.url, this.lastPoppedUrl);

      if (event instanceof NavigationStart) {
        if (event.url !== this.lastPoppedUrl) {
          this.yScrollStack.push(window.scrollY);
        }
      } else if (event instanceof NavigationEnd) {
        if (event.url === this.lastPoppedUrl) {
          this.lastPoppedUrl = undefined;
          window.scrollTo(0, this.yScrollStack.pop());
        } else {
          window.scrollTo(0, 0);
        }

        // PAX
        this.shared.scrollToElement('.sidebar-wrapper ul.nav li.active', false, 100, false);
      }
    });
    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      elemMainPanel.scrollTop = 0;
      elemSidebar.scrollTop = 0;
    });
    // TODO: разобраться с поведением на широких таблицах
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      // console.log('New PerfectScrollbar', 1);
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar, {wheelSpeed: 0.5, suppressScrollX: true});
    }
    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      this.shared.sidebarOpenClose();
      // this.navbar.sidebarClose();
    });
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
  }

  ngOnDestroy(): void {
    this.events.unsubscribe();
  }

  isMap() {
    return (this.location.prepareExternalUrl(this.location.path()) === '/#/maps/fullscreen');
  }

  runOnRouteChange(): void {
    // debugLog('ROUTE 3', this.location, this.auth.loggedIn());
    // to login page if not authorized
    if (!this.auth.loggedIn()) {
      return;
    }

    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      // console.log('New PerfectScrollbar', 2);
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar, {wheelSpeed: 0.5, suppressScrollX: true});
      ps.update();
    }
  }

  isMac(): boolean {
    return (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0);
  }

  checkCredential(cred) {
    return this.shared.checkCredential(cred);
  }

  isChatActive() {
    return this.ws.isChatActive;
  };

}
