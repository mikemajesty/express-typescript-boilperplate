import { DateTime } from 'luxon';

import { ApiException } from '@/utils/exception';
import { ApiNextFunction, ApiResponse } from '@/utils/types/express';

export const errorHandler = (err: ApiException, req: any, res: ApiResponse, next: ApiNextFunction): void => {
  req.infra.logger.error(err);

  const code = Number([err['code'], err['statusCode'], 500].find(Boolean));

  res.status(code).send({
    error: {
      name: err?.name,
      message: [err['message'], err].find(Boolean),
      traceId: req.id,
      path: req['path'],
      timestamp: DateTime.fromJSDate(new Date()).setZone(process.env.TZ),
    },
  });

  next();
};
