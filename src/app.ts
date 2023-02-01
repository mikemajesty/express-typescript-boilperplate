import { PrismaClient } from '@prisma/client';
import { bold } from 'colorette';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { ICacheAdapter, MemoryCacheService, RedisCacheService } from './infra/cache';
import { ConfigService, IConfigAdapter, Secrets } from './infra/config';
import { IDataBaseService } from './infra/database/adapter';
import { MongoService } from './infra/database/mongo/service';
import { ConnectionModel } from './infra/database/mongo/types';
import { PrismaService } from './infra/database/prisma/service';
import { HttpService } from './infra/http';
import { ILoggerAdapter } from './infra/logger/adapter';
import { LoggerService } from './infra/logger/service';
import { IInfra } from './interfaces/infra';
import { IRoutes } from './interfaces/routes';
import { errorHandler } from './middlewares/error';
import { infraMiddleware } from './middlewares/infra';
import { loggerMiddleware } from './middlewares/logger';
import { NextHandleFunction } from './utils/types/express';

class App {
  public app: express.Application;
  public config!: IConfigAdapter;
  public logger!: ILoggerAdapter;
  public redis!: ICacheAdapter;
  public memory!: ICacheAdapter;
  public mongo!: IDataBaseService<typeof mongoose, ConnectionModel>;
  public prisma!: IDataBaseService<PrismaClient, any>;
  public infra!: IInfra;

  constructor(private routes: IRoutes<object>[]) {
    this.config = new ConfigService();
    this.logger = new LoggerService();

    this.redis = new RedisCacheService({ url: this.config.get(Secrets.REDIS_URL) }, this.logger);
    this.memory = new MemoryCacheService(this.logger);

    this.mongo = new MongoService(this.logger);
    this.prisma = new PrismaService(this.logger);

    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutesMiddlewares(routes);

    this.infra = {
      config: this.config,
      logger: this.logger,
      http: new HttpService(),
      redis: this.redis,
      memory: this.memory,
      mongo: this.mongo,
      prisma: this.prisma,
    };
  }

  public async listen() {
    const port = this.infra.config.get<number>(Secrets.PORT);
    const host = this.infra.config.get(Secrets.HOST);
    const URI = `http://${host}:${port}`;

    this.app.listen(port, host, () => {
      this.infra.logger.trace({
        message: `    ============== ${bold(this.infra.config.get(Secrets.ENV).toUpperCase())} ==============`,
      });
      this.infra.logger.trace({ message: `🚀 App listening at ${bold(URI)} 🚀` });

      this.logRoutes();
    });

    await this.infra.redis.connect();
    this.infra.memory.connect();

    const connection = this.infra.mongo.getConnectionString({
      dbName: 'cats',
      host: this.infra.config.get(Secrets.MONGO_HOST),
      port: this.infra.config.get(Secrets.MONGO_PORT),
      pass: this.infra.config.get(Secrets.MONGO_PASSWORD),
      user: this.infra.config.get(Secrets.MONGO_USER),
    });

    await this.infra.mongo.connect(connection);
    await this.infra.prisma.connect();
  }

  private logRoutes() {
    for (const route of this.routes) {
      this.infra.logger.trace({ message: `${bold(route.constructor.name)} dependencies initialized` });

      const routeMap = route.router.stack.filter(r => r?.route).map(r => r.route);

      for (const r of routeMap) {
        this.infra.logger.trace({
          message: `${route.controller.constructor.name} {${r.path} - ${Object.keys(r.methods).toString().toUpperCase()}}`,
        });
      }
    }
  }

  private async initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: this.config.get(Secrets.ORIGIN),
        credentials: this.config.get(Secrets.CREDENTIALS),
      }),
    );
    this.app.use(infraMiddleware(this.infra));
    this.app.use(loggerMiddleware as NextHandleFunction);
  }

  private initializeRoutesMiddlewares(routes: IRoutes<unknown>[]) {
    for (const route of routes) {
      this.app.use('/', route.router);
      this.initializeErrorMiddleware(route);
    }
  }

  private initializeErrorMiddleware(route: IRoutes<unknown>) {
    route.router.use(errorHandler);
  }
}

export default App;
