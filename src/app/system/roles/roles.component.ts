import {AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {MULKeyValueCategory} from '../../classes/types';
import {CredentialsItem, mainMenuTypes, MenuItem} from '../../classes/routes';

declare const $: any;

@Component({
  selector: 'romb-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;

  credentialsStructure: CredentialsItem[] = [];
  mainMenuStructure: MenuItem[] = [];

  user = {
    name: '',
    roles: [],
    nameObject: null,
    active: false
  };

  constructor(private shared: SharedService,
              private api: ApiService) {
  }

  ngOnInit() {
    // console.log('ngOnInit', this.shared.doc);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit', this.shared.doc);
  }

  ngAfterViewChecked() {
    // console.log('ngAfterViewChecked', this.shared.doc);
  }

  async afterOpen(doc: any) {
    // console.log('--------- doc', doc);
    if (!(doc && doc._id)) {
      console.log('!!!Save role before edit menus and credentials');
      return;
    }

    const creds = await this.api.getRoleCredentials(doc._id);
    this.credentialsStructure = creds.structure;
    if (!(doc.credentials && doc.credentials instanceof Array && doc.credentials.length)) {
      doc.credentials = creds.credentials;
      this.dataTable.changeCardProperty(doc.credentials, 'credentials');
      // console.log('+++++ new credentials', doc.credentials);
    }

    if (!doc._id) {
      console.log('!!!Save role before edit');
      this.mainMenuStructure = await this.api.getMainMenuStructure({
        type: mainMenuTypes.user
      });
    } else {
      this.mainMenuStructure = await this.api.getMainMenuStructure({
        type: mainMenuTypes.role,
        roleID: doc._id
      });
    }
    if (!(doc.mainMenu && doc.mainMenu instanceof Array && doc.mainMenu.length)) {
      doc.mainMenu = this.shared.mainMenu;
      this.dataTable.changeCardProperty(doc.mainMenu, 'mainMenu');
      console.log('+++++++++ new mainmenu', doc.mainMenu);
    }
  }

  updateMainMenu(structure: MenuItem[], item: any) {
    // console.log('+updateMainMenu', structure, item);
    if (!item) {
      return;
    }

    item.mainMenu = [];
    // if (!(item.mainMenu && item.mainMenu instanceof Array)) {
    //   item.mainMenu = [];
    // }

    if (structure && structure instanceof Array) {
      structure.forEach(menu => {
        if (menu.active) {
          if (item.mainMenu.indexOf(menu.id) === -1) {
            item.mainMenu.push(menu.id);
          }

          if (menu.children && menu.children instanceof Array) {
            menu.children.forEach(sub => {
              if (sub.active && item.mainMenu.indexOf(sub.id) === -1) {
                item.mainMenu.push(sub.id);
              }
            });
          }
        }
      });
    }

    this.dataTable.changeCardProperty(item.mainMenu, 'mainMenu');
    console.log('updateMainMenu', structure, item.mainMenu);
  }

  updateCredentials(structure, item) {
    if (!item) {
      return;
    }

    if (!(item.credentials && item.credentials instanceof Array)) {
      item.credentials = [];
    } else {
      item.credentials.length = 0;
    }
    // console.log('updateCredentials', structure, item.credentials);

    if (structure && structure instanceof Array) {
      structure.forEach(group => {
        if (group.active) {
          if (item.credentials.indexOf(group.group) === -1) {
            item.credentials.push(group.group);
          }

          if (group.credentials && group.credentials instanceof Array) {
            group.credentials.forEach(cred => {
              if (cred.active && item.credentials.indexOf(cred.id) === -1) {
                item.credentials.push(cred.id);
              }
            });
          }
        }
      });
    }
    item.credentials = item.credentials.sort((a, b) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    this.dataTable.changeCardProperty(item.credentials, 'credentials');
    // console.log('updateCredentials', structure, item.credentials);
  }

  getObjJSON(value) {
    return this.shared.getObjJSON(value, true);
  }
}
