import { IRoutes } from '@/interfaces/routes';
import { Controller } from '@/utils/types/controller';
import { Router } from '@/utils/types/express';

import { HealthController } from './controller';
import { HealthService } from './service';

export class HealthRoute implements IRoutes<HealthController> {
  router = Router();

  controller = new HealthController(new HealthService());

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.get(['/', '/health'], this.controller.health as Controller);
  }
}
