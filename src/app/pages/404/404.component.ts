import {Component, OnInit} from '@angular/core';
import {debugLog} from '../../app.log';

@Component({
  selector: 'romb-404',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss']
})
export class NotFound404Component implements OnInit {
  test: any;

  constructor() {
  }

  ngOnInit() {
    // debugLog('404 ngOnInit');
  }
}
