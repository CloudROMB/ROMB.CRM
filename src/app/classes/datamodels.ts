import {defaultOrderStatuses} from './selectobjects';

export const defaultMetadataField: any = {
  name: 'fieldName' + (Math.random() * 10000).toFixed(0).toString(),
  active: true,
  required: false,
  type: 'string',
  kind: null,
  listField: false,
  header: 'Table Header',
  cardField: false,
  label: 'Card Field',
  cardPanel: 'props',
  headerIcon: null,
  visible: false,
  visibleSelect: false,
  readonly: false,
  templateHeader: null,
  headerColor: null,
  templateCell: null,
  cellColors: null,
  sortable: false,
  indexed: false,
  unique: false,
  resizable: false,
  width: 160,
  cutSize: 40,
  trueIcon: null,
  falseIcon: null,
  align: null,
  styleClass: null
};

export const defaultCredentialGroup: any = {
  'active': true,
  'group': 'references',
  'name': 'References',
  'descr': 'Credentials for references',
  'credentials': [
    {
      'active': true,
      'id': 'reference_delete',
      'name': 'Delete a card of the type',
      'descr': 'User can delete a document card of this type'
    }
  ]
};

export const defaultCredentialElement: any = {
  'active': true,
  'id': 'reference_some_action',
  'name': 'Some action with the type',
  'descr': 'User can make some action with this type'
};

export const defaultMenuLink: any = {
  'active': true,
  'id': 'menuItem' + (Math.random() * 10000).toFixed(0).toString(),
  'path': '/reference/reference' + (Math.random() * 1000).toFixed(0).toString(),
  'title': 'Reference',
  'descr': 'Reference of items',
  'type': 'link',
  'faicon': 'list'
};

export const defaultMenuGroup: any = {
  'active': true,
  'id': 'menuItem' + (Math.random() * 10000).toFixed(0).toString(),
  'path': '/references',
  'type': 'sub',
  'icontype': 'grid_on',
  'collapse': 'references',
  'title': 'References',
  'descr': 'Reference of items',
  'faicon': 'list',
  'children': [
    {
      'active': true,
      'id': 'reference' + (Math.random() * 100).toFixed(0).toString(),
      'path': 'reference' + (Math.random() * 100).toFixed(0).toString(),
      'title': 'reference' + (Math.random() * 100).toFixed(0).toString(),
      'descr': 'Reference of items',
      'type': 'link',
      'icontype': 'assignment_ind'
    },
    {
      'active': true,
      'id': 'reference' + (Math.random() * 100).toFixed(0).toString(),
      'path': 'reference' + (Math.random() * 100).toFixed(0).toString(),
      'title': 'reference' + (Math.random() * 100).toFixed(0).toString(),
      'descr': 'Reference of items',
      'type': 'link',
      'icontype': 'delicious'
    }
  ]
};

export const mailDocument: any = {
  _id: '',
  body: {
    date: null,
    from: [],
    headers: null,
    html: '',
    inReplyTo: [],
    messageId: '',
    priority: '',
    receivedDate: '',
    references: null,
    replyTo: [],
    subject: '',
    text: '',
    to: []
  },
  box: 'inbox',
  id: '',
  stamp: '',
  receivedDate: '',
  orderType: defaultOrderStatuses[1],
  files: []
};

export const MetadataDocument: any = {
  _id: null,
  code: null,
  name: '',
  system: false,
  type: null,
  disableCredentials: false,
  props: [],
  menuItem: [],
  credentials: [],
  descr: null
};

export const brandDocument: any = {
  _id: '',
  name: '',
  parent: null,
  mainPartner: {},
  partnersCount: 0
};

export const userDocument: any = {
  contact_id: '',
  department: '',
  partner: '',
  FIO: {
    fullName: ''
  },
  login: '',
  password: '',
  name: '',
  roles: [],
  comment: ''
};
export const contractorDocument: any = {
  _id: '',
  active: true,
  parent: null,
  requisites: {
    kpp: '',
    state: {
      status: '',
      actuality_date: null,
      registration_date: null,
      liquidation_date: null
    },
    founders: {},
    management: {
      name: '',
      post: '',
      dob: '',
      phone: '',
      email: ''
    },
    opf: {
      type: '',
      code: '',
      full: '',
      short: ''
    },
    name: {
      full_with_opf: '',
      short_with_opf: '',
      latin: '',
      full: '',
      short: ''
    },
    address: {
      value: '',
      data: {}
    },
    actualaddress: {
      value: '',
      data: {}
    },
    postaddress: {
      value: '',
      data: {}
    },
    website: '',
    accountant: {
      name: '',
      phone: ''
    },
    contract_number: '',
    contract_date: ''
  },
  bank_accounts: [],
  contacts: [],
  brands: [],
  blocking: [],
  // is_blocked: false,
  mainCompany: false,
  applyOrders: false,
  comment: ''
};

export const bankAccountDocument: any = {
  id: '',
  bank_name: '',
  bank: {
    name: {
      payment: ''
    },
    correspondent_account: '',
    bic: ''
  },
  settlement_account: '',
  active: true
};

export const taskDocument: any = {
  _id: null,
  stamp: null,
  done: null,
  name: '',
  text: '',
  finished: false
};

export const creditRequestDocument: any = {
  _id: null,
  name: ''
};

export const reestrDocument: any = {
  partner: {
    name: ''
  },
  organization: {
    id: '',
    name: ''
  },
  department: {
    id: '',
    name: ''
  },
  bank: {
    id: '',
    name: ''
  },
  customer: {
    name: '',
    phone: '',
    passport: '',
    passportOrgan: '',
    passportAddress: '',
    passportDepartment: ''
  },
  user: {
    id: '',
    name: ''
  },
  orderDate: null,
  orderSumm: 0,
  orderPurchaseSumm: 0,
  orderInitialFee: 0,

  hasContractBlank: null,
  hasSignedScans: null,
  signStatus: null,
  checkScansStatus: null,
  paymentStatus: null,
  deliveryStatus: null,
  mailText: '',
  files: []
};

export class DataModels {
  reestr: any;
  mail: any;
  contractor: any;
  todo: any;
}
