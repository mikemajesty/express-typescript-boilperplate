import { IInfra } from '@/interfaces/infra';
import { ApiRequest } from '@/utils/types/express';

export const infraMiddleware = (infra: IInfra) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: ApiRequest, res: any, next: any) => {
    req.infra = { config: infra.config, logger: infra.logger, http: infra.http };
    next();
  };
};
