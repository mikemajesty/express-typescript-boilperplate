import { Router } from 'express';
import { HealthController } from '../controllers/health';
import { IRoutes } from '../intercafes/routes';

export class HealthRoute implements IRoutes {
  public path = '/';
  
  public router = Router();

  public healthController = new HealthController()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.healthController.health);
  }
}
