import { IHttpAdapter } from '@/infra/http';

import { ICacheAdapter } from '../infra/cache';
import { IConfigAdapter } from '../infra/config';
import { ILoggerAdapter } from '../infra/logger';

export interface IInfra {
  logger: ILoggerAdapter;
  config: IConfigAdapter;
  http: IHttpAdapter;
  redis?: ICacheAdapter;
  memory?: ICacheAdapter;
}
