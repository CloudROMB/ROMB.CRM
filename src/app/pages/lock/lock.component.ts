import {Component, OnInit} from '@angular/core';

declare const $: any;

@Component({
  selector: 'romb-page-lock',
  templateUrl: './lock.component.html'
})

export class LockComponent implements OnInit {
  test: Date = new Date();

  ngOnInit() {
    setTimeout(function () {
      // after 1000 ms we add the class animated to the login/register card
      $('.card').removeClass('card-hidden');
    }, 700);
  }
}
