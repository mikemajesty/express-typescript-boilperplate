import { IConfigAdapter } from './adapter';
import { Secrets } from './types';

export class ConfigService implements IConfigAdapter {
  get<T>(key: Secrets): T {
    const env = process.env[String(key)];
    if (!env)
      throw new Error(
        `${key} is not defined in environment variables`,
      );

    return env as unknown as T;
  }
}
