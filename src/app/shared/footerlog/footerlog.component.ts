import {Component, OnInit} from '@angular/core';
import {LogService} from '../../services/log.service';
import {Router} from '@angular/router';

@Component({
  selector: 'romb-footerlog',
  templateUrl: './footerlog.component.html',
  styleUrls: ['./footerlog.component.scss']
})
export class FooterlogComponent implements OnInit {
  public log = {
    headerRow: [],
    dataRows: []
  };

  constructor(private logSvc: LogService,
              public router: Router) {
    logSvc.getLog(null).subscribe(data => {
      // console.log('footer getLog', data);
      this.log.headerRow = ['#', 'Описание', 'Автор', 'Объект'];
      this.log.dataRows = [];
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          this.log.dataRows.push([
            String(data[i].id),
            data[i].event.descr,
            data[i].event.author,
            data[i].event.stamp,
            data[i].object.type,
            data[i].object.kind,
            data[i].object.link
          ]);
        }
      }
    });
  }

  ngOnInit() {
  }

  leftPage(link) {
    console.log('navigate', link);
    this.router.navigate([link]);
  }

}
