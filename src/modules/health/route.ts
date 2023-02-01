import { IRoutes } from '@/interfaces/routes';
import { ControllerHandleFunction, Router } from '@/utils/types/express';

import { HealthController } from './controller';

export class HealthRoute implements IRoutes<HealthController> {
  router = Router();

  controller = new HealthController();

  constructor() {
    this.initializeRoutes();
  }

  async initializeRoutes(): Promise<void> {
    this.router.get(['/', '/health'], this.controller.health as ControllerHandleFunction);
  }
}
