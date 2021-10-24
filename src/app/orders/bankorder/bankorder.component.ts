import {Component, OnInit} from '@angular/core';
import {creditRequestDocument} from '../../classes/datamodels';
import {debugLog, errorLog} from '../../app.log';
import {AlertsModule} from '../../alerts/alerts.module';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'romb-bankorder',
  templateUrl: './bankorder.component.html',
  styleUrls: ['./bankorder.component.scss']
})
export class BankorderComponent implements OnInit {
  structureCreditRequest = creditRequestDocument;

  cardTabs = [];
  cardFields = [];

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.fillCard().then();
  }

  async fillCard() {
    const meta = await this.api.getMeta('orders')
      .catch(err => {
        errorLog('TableLite getMeta():', err);
        AlertsModule.notifyDangerMessage('Не удалось получить тип метаданных');
      });

    if (!(meta && meta.result)) {
      return;
    }
    // debugLog('~~~ META orders', meta);

    // FILL card tabs
    let first = true;
    if (meta.data.tabs) {
      meta.data.tabs.forEach(tab => {
        let name = 'Карточка';

        switch (tab) {
          case 'main':
            name = 'Карточка';
            break;
          case 'props':
            name = 'Реквизиты';
            break;
        }

        this.cardTabs.push({
          id: tab,
          name: name,
          active: first
        });

        first = false;
      });
    } else {
      this.cardTabs.push({
        id: 'main',
        name: 'Карточка',
        active: true
      });
    }

    // FILL card properties

  }
}
