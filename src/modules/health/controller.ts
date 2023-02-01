import { name, version } from '@/../package.json';
import { ApiRequest, ApiResponse } from '@/utils/types/express';

import { Test } from '../../core/usecases/teste';

export class HealthController {
  public health = (req: ApiRequest, res: ApiResponse) => {
    new Test();
    const message = `${name}-${version} UP!!`;
    req.infra.logger.info({ message });
    res.json(message);
  };
}
