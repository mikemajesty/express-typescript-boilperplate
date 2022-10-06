import axios, { Axios, AxiosRequestConfig } from 'axios';

import { IHttpAdapter } from './adapter';

export class HttpService implements IHttpAdapter {
  create<TConfig = AxiosRequestConfig>(config?: TConfig): Axios {
    return axios.create(config || { timeout: 5000 });
  }
}
