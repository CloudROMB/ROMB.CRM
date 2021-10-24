import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import {ApiService} from '../services/api.service';
import {mainMenuTypes, MenuItem} from '../classes/routes';
import {User} from '../classes/types';
import {AuthService} from '../services/auth.service';
import {SharedService} from '../services/shared.service';
import {Observable, Subscription} from 'rxjs';

declare const $: any;

@Component({
  selector: 'romb-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  public menuItems: MenuItem[];
  public events: any;
  public user: User;
  private eventsSubscription: Subscription;

  constructor(private api: ApiService,
              private cdr: ChangeDetectorRef,
              private auth: AuthService,
              private shared: SharedService) {
  }

  sidebarMinMax() {
    this.shared.sidebarMinMaximize();
  }

  async ngOnInit() {
    if (!this.user) {
      this.user = this.auth.loadUserFromStorage(false);
      if (!this.user) {
        return;
      }
    }

    this.eventsSubscription = this.api.getNewEvents().subscribe(data => {
      this.events = data;
    });

    this.menuItems = await this.api.getMainMenuStructure({
      type: mainMenuTypes.user
    });
    this.menuItems = this.menuItems.filter(item => {
      if (item.children && item.children.length) {
        item.children = item.children.filter(sub => {
          return (sub.active === true);
        });
      }
      return (item.active === true);
    });

    // this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    // $('mat-icon.child').find('svg').attr('viewBox', '0 0 18 18');
    // $('mat-icon.root svg').attr('viewBox', '0 0 24 24');

    // console.log('sidebar ngAfterViewInit');
    // this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    // this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  updatePS(e): void {
    // console.log(e);
    // PAX
    this.shared.scrollToEl(e.target, false, 100, false);
    // console.log('updatePS()');
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()
    ) {
      // console.log('New PerfectScrollbar', 3);
      const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
      const ps = new PerfectScrollbar(elemSidebar, {wheelSpeed: 0.5, suppressScrollX: true});
    }
  }

  isMac(): boolean {
    // let bool = false;
    // if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
    //   bool = true;
    // }
    return (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0);
  }

  isMobileMenu() {
    // console.log('$(window).width()', $(window).width());
    this.cdr.markForCheck();

    return ($(window).width() <= 991);
  }

  logOut() {
    return this.shared.queryLogOut();
  }


}
