import { ApiRequest, ApiResponse } from '@/utils/types/express';

import { IHealthService } from './adapter';
interface IHealthController {}

export class HealthController {
  constructor(private service: IHealthService) {}

  public health = (req: ApiRequest, res: ApiResponse): void => {
    const message = this.service.getHealth();
    req.infra.logger.info({ message });
    res.json(message);
  };
}
