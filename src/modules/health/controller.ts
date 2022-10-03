import { NextFunction, Request, Response } from 'express';

import { IHealthService } from './adapter';

export class HealthController {
  constructor(private service: IHealthService) {}

  public health = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.json(this.service.getHealth());
    } catch (error) {
      next(error);
    }
  };
}
