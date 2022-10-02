import { Secrets } from './types';

export interface IConfigAdapter {
  get<T = string>(key: Secrets): T;
}
