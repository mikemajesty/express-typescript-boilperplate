import { PrismaClient } from '@prisma/client';

import { ILoggerAdapter } from '@/infra/logger';
import { NOT_IMPLEMENT_ERROR } from '@/utils/types/error';

import { IDataBaseService } from '../adapter';

export class PrismaService implements IDataBaseService<PrismaClient, any> {
  client!: PrismaClient;

  constructor(private readonly logger: ILoggerAdapter) {
    this.client = new PrismaClient();
  }

  getConnectionString(): string {
    throw NOT_IMPLEMENT_ERROR;
  }

  async connect(): Promise<PrismaClient> {
    await this.client.$connect();
    this.logger.trace({ message: 'Prisma Connected!' });
    return this.client;
  }
}
