import { Router, IRoute } from 'express';
import { HealthController } from '../controllers/health';
import { IRoutes } from '../interfaces/routes';

export class HealthRoute implements IRoutes<HealthController> {
  public router = Router();

  public controller = new HealthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/`, this.controller.health);
  }
}
