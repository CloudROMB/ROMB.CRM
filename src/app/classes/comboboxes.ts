export let defaultComboListDocumentRequestStates = <ComboListDocumentRequestParams>{
  deleted: false,
  offset: 0,
  limit: 0,
  filter: null,
  sortAsc: false,
  sortBy: 'stamp',
  criteria: null
};

export interface ComboListDocumentRequestParams {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortAsc?: boolean | null;
  filter?: string | null;
  deleted?: boolean | null;
  criteria?: any;
}

export let defaultComboListPropertyRequestStates = <ComboListPropertyRequestParams>{
  offset: 0,
  limit: 0,
  filter: null
};

export interface ComboListPropertyRequestParams {
  offset?: number;
  limit?: number;
  filter?: string | null;
}
