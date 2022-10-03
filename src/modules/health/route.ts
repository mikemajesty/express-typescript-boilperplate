import { Router } from 'express';

import { IRoutes } from '../../interfaces/routes';
import { HealthController } from './controller';
import { HealthService } from './service';

export class HealthRoute implements IRoutes<HealthController> {
  public router = Router();

  public controller = new HealthController(new HealthService());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/`, this.controller.health);
  }
}
