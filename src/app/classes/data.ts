export class AddressObject {
  name: string;

  capital_marker?: string;
  city?: string;
  city_type?: string;
  city_type_full?: string;
  city_with_type?: string;
  country?: string;
  flat?: string;
  flat_type?: string;
  flat_type_full?: string;
  house?: string;
  house_type?: string;
  house_type_full?: string;
  metro?: string;
  postal_code?: string;
  region?: string;
  region_type?: string;
  region_type_full?: string;
  region_with_type?: string;
  street?: string;
  street_type?: string;
  street_type_full?: string;
  street_with_type?: string;

  tax_office?: string;
  tax_office_legal?: string;
  okato?: string;
  oktmo?: string;

  qc_geo?: string;
  geo_lat?: string;
  geo_lon?: string;

  fias_actuality_state?: string;
  fias_code?: string;
  fias_id?: string;
  fias_level?: string;
  house_fias_id?: string;
  house_kladr_id?: string;
  kladr_id?: string;
  city_fias_id?: string;
  city_kladr_id?: string;
  region_fias_id?: string;
  region_kladr_id?: string;
  street_fias_id?: string;
  street_kladr_id?: string;

  _id?: string;
  stamp: string | null;
  deleted?: boolean;
}

export enum DocumentStatuses {
  active = 'Активный',
  blocked = 'Заблокирован'
}

export enum CardStatuses {
  active = 'работа разрешена',
  blocked = 'работа заблокирована'
}

export enum UserStatuses {
  active = 'Активный',
  blocked = 'Заблокирован'
}

export enum ContractorStatuses {
  active = 'Активный',
  blocked = 'Заблокирован'
}

export class UserObject {
  _id: string;
  stamp: string | null;
  name: string | null;
  roles: string[] | null;
  status: UserStatuses | null;
}

export class DocumentObject {
  _id?: string;
  stamp?: any;
  author?: any;
  changed?: any;
  editor?: any;
  code?: string;
  name?: string;
  deleted?: boolean;
  valid?: boolean;
  system?: boolean;
  done?: string;
  text?: string;
  active?: boolean;
  comment?: string | null;
  finished?: boolean | null;
  props?: Array<any>;
  roles?: Array<any>;
  FIO?: any;
  bank?: any;
  bik?: string;
}

export const defaultStructurePassport = {
  category: '',
  number: '',
  serial: '',
  divisionName: '',
  divisionCode: '',
  registrationAddress: '',
  comment: ''
};

export const defaultStructureID = {
  category: '',
  number: '',
  divisionName: '',
  comment: ''
};

export const defaultStructurePeople = {
  surname: '',
  name: '',
  patronymic: '',
  gender: null,
  fullName: '',
  documents: [],
  files: []
};

export const defaultStructureReference = {
  code: '',
  name: '',
  comment: '',
  files: [],
};
