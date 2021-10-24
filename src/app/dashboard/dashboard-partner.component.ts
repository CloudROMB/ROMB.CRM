import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../services/api.service';
import {AlertsModule} from '../alerts/alerts.module';

declare const $: any;

@Component({
  selector: 'romb-dashboard-partner',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard-partner.component.html'
})
export class DashboardPartnerComponent implements OnInit, AfterViewInit, OnDestroy {
  attentions = [];

  constructor(private api: ApiService) {
  }

  async loadAttentions() {
    const res = await this.api.getList('attentions', {
      deleted: false,
      offset: 0,
      limit: 15,
      sortAsc: false,
      sortBy: 'stamp'
    }, {
      active: true
    });
    if (res && res.result) {
      console.log('loadAttentions:', res);
      this.attentions = res.data.list;
    } else {
      console.log('Get Items Error:', res.message);
      AlertsModule.notifyMessage('Не удалось получить объявления.');
    }
  }

  // constructor(private navbarTitleService: NavbarTitleService) { }
  public ngOnInit() {
    this.loadAttentions().then();
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
  }

  updateHTMLView() {
    let inHTML = '';
    if (this.attentions && this.attentions.length) {
      this.attentions.forEach(el => {
        const header = `<h3 style="color: darkred;">${el.name}</h3>`;
        const text = `<div>${el.text}</div>`;
        inHTML += header + text;
      });
    }
    return inHTML;
  }
}
