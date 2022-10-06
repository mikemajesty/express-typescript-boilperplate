import { name, version } from '@/../package.json';

import { IHealthService } from './adapter';

export class HealthService implements IHealthService {
  getHealth(): string {
    return `${name}-${version} UP!!`;
  }
}
