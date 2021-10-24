import {Component, OnInit} from '@angular/core';
import {AuthResponse} from '../../classes/responses';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {SharedService} from '../../services/shared.service';
import {Contacts} from '../../classes/types';

declare const $: any;

declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'romb-user-page',
  templateUrl: 'user-page.component.html',
  styleUrls: ['user-page.component.scss']
})

export class UserPageComponent implements OnInit {
  public contacts: Contacts[] = [];

  public user: any = {
    login: '',
    email: '',
    company: 'ООО',
    address: '',
    index: '',
    country: 'Россия',
    city: 'Город',
    fullname: '',
    phone: '',
    workphone: '',
    info: 'Не думаю о секундах свысока',

    files: []
  };
  public downloadTable: TableData;

  selectedCity = 'id1';
  cities = [
    {value: 'id1', viewValue: 'Москва'},
    {value: 'id8', viewValue: 'Нижний Новгород'},
    {value: 'id2', viewValue: 'Новосибирск'},
    {value: 'id3', viewValue: 'Ростов-на-Дону'},
    {value: 'id4', viewValue: 'Екатеринбург'},
    {value: 'id5', viewValue: 'Санкт-Петербург'},
    {value: 'id6', viewValue: 'Barcelona'},
    {value: 'id7', viewValue: 'Владивосток'}
  ];

  constructor(private api: ApiService,
              private shared: SharedService,
              private auth: AuthService) {
  }

  ngOnInit() {
    this.api.getProfile()
      .then(data => {
        const res = <AuthResponse>data;
        if (res.result === true) {
          this.user.login = res.data.login;
          this.user.email = res.data.email;
          if (res.data.FIO) {
            this.user.fullname = res.data.FIO.fullName;
          }

          this.shared.updateInputs();
        }
      });

    this.downloadTable = {
      headerRow: ['#', 'Описание', 'Дата', 'Автор', 'Salary', 'Actions'],
      dataRows: [
        ['1', 'Andrew Mike', 'Develop', '2013', '99,225', ''],
        ['2', 'John Doe', 'Design', '2012', '89,241', 'btn-round'],
        ['3', 'Alex Mike', 'Design', '2010', '92,144', 'btn-simple'],
        ['4', 'Mike Monday', 'Marketing', '2013', '49,990', 'btn-round'],
        ['5', 'Paul Dickens', 'Communication', '2015', '69,201', '']
      ]
    };
  }

  changeContacts(contacts) {
    console.log(contacts);
  }
}
