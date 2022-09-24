// import { Sort } from 'features/sortBy';
import { OwnerFilter } from 'api/consts';

import { RequestParams, FiltersValues } from './types';

const DEFAULT_FILTER_VALUES: FiltersValues = {
  owner: OwnerFilter.All,
  status: [],
  createAt: '',
};

const DEFAULT_REQUEST_PARAMS: RequestParams = {
  query: '',
  // owner: '',
  // sortBy: Sort.Last,
  // status: [],
  // createAt: '',
};

export { DEFAULT_REQUEST_PARAMS, DEFAULT_FILTER_VALUES };