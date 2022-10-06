import { IHttpAdapter } from '@/infra/http';

import { IConfigAdapter } from '../infra/config';
import { ILoggerAdapter } from '../infra/logger';

export interface IInfra {
  logger: ILoggerAdapter;
  config: IConfigAdapter;
  http: IHttpAdapter;
}
