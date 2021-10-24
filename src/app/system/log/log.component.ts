import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CellType, DataTableColumn} from '../../classes/tables';

declare const $: any;

@Component({
  selector: 'romb-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit, AfterViewInit {

  constructor() { }


  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
