import { v4 as uuidv4 } from 'uuid';

import { ApiNextFunction, ApiRequest, ApiResponse } from '@/utils/types/express';

export const loggerMiddleware = (req: ApiRequest, res: ApiResponse, next: ApiNextFunction): void => {
  if (!req.headers['traceid']) {
    req.headers['traceid'] = uuidv4();
  }

  req.infra.logger.httpLogger(req, res, next);
  next();
};
