import {Component, EventEmitter, Input, OnInit, AfterViewChecked, Output} from '@angular/core';
import {Contact, Contacts, ContactType, defaultContactsLabels, SuggestionTypes} from '../../classes/types';
import {SharedService} from '../../services/shared.service';
import {UUID} from 'angular2-uuid';
import {ApiService} from '../../services/api.service';
import {AlertsModule} from '../../alerts/alerts.module';

declare const $: any;

@Component({
  selector: '[rombEmployees]',
  templateUrl: './employees.component.html',
  styleUrls: ['../multielements.scss', './employees.component.scss']
})
export class EmployeesComponent implements OnInit, AfterViewChecked {
  contactsLabels = defaultContactsLabels;
  suggType = SuggestionTypes;
  contactType = ContactType;
  @Input() editMode = false;
  @Input() mainList;
  @Input() partner = {};
  @Input() itemId = '';
  @Input() contactList: Contacts[] = [];
  @Input() mode = 'simple';
  @Output() multiChange = new EventEmitter();
  departmentParent = {};
  registerPerson: Contacts;
  parentId = '';
  registerModalActive = false;

  constructor(
    private shared: SharedService,
    private api: ApiService
  ) {
  }

  ngOnInit() {
    if (!(this.contactList && this.contactList.length === 0)
      && this.checkCredential('partners-contacts-edit-toggle')
      && this.mode === 'advanced') {
      this.editMode = true;
    }
  }

  /**
   *
   */
  ngAfterViewChecked() {
    this.departmentParent = {
      'partner.id': this.itemId,
      active: true
    };
  }

  async addPerson() {
    const newPerson = {
      id: UUID.UUID(),
      name: '',
      position: '',
      department: {},
      partner: this.partner || {},
      contacts: []
    };
    console.log(newPerson);
    this.contactList.push(newPerson);
    // console.log('contactList', this.contactList);

    setTimeout(() => {
      const el = document.querySelector('#row-' + newPerson.id);
      el.scrollIntoView(true);
    }, 100);

    this.multiChange.emit(this.contactList);
  }

  async removePerson(person) {
    const choice = await AlertsModule.deleteAlert('Удалить контакт?');
    if (choice === true) {
      this.contactList = this.contactList.filter(el => {
        return (person.id !== el.id);
      });
      this.multiChange.emit(this.contactList);
    }
  }

  // addCompany(person) {
  //   person.company = ' ';
  //   person.department = '';
  //   this.multiChange.emit(this.contactList);
  // }

  // removeCompany(person) {
  //   person.company = null;
  //   person.department = null;
  //   this.multiChange.emit(this.contactList);
  // }

  addComment(person) {
    person.comment = ' ';
    this.multiChange.emit(this.contactList);
  }

  removeComment(person) {
    person.comment = null;
    this.multiChange.emit(this.contactList);
  }

  addContact(person, type) {
    if (!person.contacts) {
      person.contacts = [];
    }
    person.contacts.push({
      id: UUID.UUID(),
      type: type,
      value: '',
      comment: ''
    });
    this.multiChange.emit(this.contactList);
  }

  removeContact(person, contact) {
    person.contacts = person.contacts.filter(el => {
      return (contact.id !== el.id);
    });
    this.multiChange.emit(this.contactList);
  }

  changeMultiValue() {
    console.log('change contact');
    this.multiChange.emit(this.contactList);
  }

  getInputType(type) {
    switch (type) {
      case ContactType.phone:
        return 'tel';
      case ContactType.email:
        return 'email';
      case ContactType.web:
        return 'url';
      default:
        return 'text';
    }
  }

  selectName(data, source) {
    source.name = data.unrestricted || data.selected;
    source.data = data;
    source.data.fullName = source.data.value;
  }

  selectDepartment(event) {
    this.multiChange.emit(this.contactList);
  }

  createRegisterPersonModal(person) {
    this.registerPerson = this.shared.copyObject(person);
    this.registerModalActive = true;
    console.log(this.registerModalActive);
  }

  destroyRegisterWindow() {
    this.registerModalActive = false;
  }

  /**
   * Переключение режима редактирования
   */
  editModeToggle() {
    if (this.checkCredential('partners-contacts-edit-toggle')) {
      this.editMode = !this.editMode;
    } else {
      AlertsModule.notifyDangerMessage('Недостаточно прав');
    }
  }

  /**
   * Проверка прав пользователя
   * @param credential
   */
  checkCredential(credential) {
    return this.shared.checkCredential(credential);
  }

  getExpansionHeadHeigth(data) {
    if (data.position.length > 20) {
      return '120px';
    }
  }
}
