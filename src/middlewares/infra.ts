import { ServerResponse } from 'node:http';

import { IInfra } from '@/interfaces/infra';
import { ApiNextFunction, NextHandleFunction } from '@/utils/types/express';

export const infraMiddleware = (infra: IInfra): NextHandleFunction => {
  return (req: any, res: ServerResponse, next: ApiNextFunction) => {
    req['infra'] = { config: infra.config, logger: infra.logger, http: infra.http, redis: infra.redis, memory: infra.memory };
    next();
  };
};
