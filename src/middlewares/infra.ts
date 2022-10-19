import { IInfra } from '@/interfaces/infra';
import { ApiRequest } from '@/utils/types/express';

export const infraMiddleware = (infra: IInfra) => {
  return (req: ApiRequest, res: any, next: any) => {
    req.infra = { config: infra.config, logger: infra.logger, http: infra.http, redis: infra.redis, memory: infra.memory };
    next();
  };
};
