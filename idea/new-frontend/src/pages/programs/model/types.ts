import { OwnerFilter } from 'api/consts';
import { Sort } from 'features/sortBy';
import { ProgramStatus } from 'entities/program';

type FiltersValues = {
  owner: OwnerFilter;
  status: ProgramStatus[];
  createAt: string;
};

type RequestParams = {
  owner?: string;
  status?: ProgramStatus[];
  query?: string;
  sortBy?: Sort;
  createAt?: string;
};

export type { FiltersValues, RequestParams };