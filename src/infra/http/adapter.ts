import { Axios, AxiosRequestConfig } from 'axios';

export abstract class IHttpAdapter<T = Axios> {
  abstract create<TConfig = AxiosRequestConfig>(config?: TConfig): T;
}
