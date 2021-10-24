import {Component, OnInit} from '@angular/core';

import * as debug from 'debug';

debug.disable(); // Disable all
// debug.enable('romb:*');

(<any>window).debugRomb = debug;  // The typescript way to extend window


// in the console type as you need:
// debugApp.enable('*'); // Enable all
// debugApp.enable('app'); // Enable app debugger
// debugApp.enable('app:*'); // Enable app debuggers if they are namespaced
// debugApp.enable('app:someModule'); // Enable someModule
// debugApp.disable('*'); // Disable all

declare const $: any;

@Component({
  selector: 'romb-app',
  styleUrls: ['./app.style.scss'],
  template: '<router-outlet></router-outlet>'
})

export class AppComponent implements OnInit {
  constructor() {
    // console.log('++++++ AppComponent');
  }

  ngOnInit() {
    $.material.init();
    //  Activate the Tooltips
    const tooltips = $('[data-toggle="tooltip"], [rel="tooltip"]');
    tooltips.tooltip({
      track: true,
      hide: {effect: 'explode', duration: 1000}
    });
    tooltips.on('click', (e) => {
      // console.log('hide', e.target);
      tooltips.tooltip('destroy').tooltip();
    });
  }
}
