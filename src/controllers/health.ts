import { NextFunction, Request, Response } from 'express';

export class HealthController {
  
  public health = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
}