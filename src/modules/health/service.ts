import { IHealthService } from "./adapter";
import { name, version } from '../../../package.json';

export class HealthService implements IHealthService {
  getHealth (): string {
    const appName = `${name}-${version} UP!!`;
    return appName
  }
}