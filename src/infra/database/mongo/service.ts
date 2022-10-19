import mongoose from 'mongoose';

import { ILoggerAdapter } from '@/infra/logger';

import { IDataBaseService } from '../adapter';
import { ConnectionModel } from './types';

export class MongoService implements IDataBaseService<typeof mongoose, ConnectionModel> {
  constructor(private readonly logger: ILoggerAdapter) {}

  getConnectionString(config: ConnectionModel): string {
    return `mongodb://${config.user}:${config.pass}@${config.host}:${config.port}/${config.dbName}?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&authSource=admin&authMechanism=SCRAM-SHA-256`;
  }

  async connect(connection: string): Promise<typeof mongoose> {
    const conn = await mongoose.connect(connection);
    if (conn.connection.readyState === 1) {
      this.logger.trace({ message: 'Mongo Connected!' });
    }
    return conn;
  }
}
