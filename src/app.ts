import { bold } from 'colorette';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { ICacheAdapter, MemoryCacheService, RedisCacheService } from './infra/cache';
import { ConfigService, IConfigAdapter, Secrets } from './infra/config';
import { IDataBaseService } from './infra/database/adapter';
import { MongoService } from './infra/database/mongo/service';
import { ConnectionModel } from './infra/database/mongo/types';
import { HttpService } from './infra/http';
import { ILoggerAdapter } from './infra/logger/adapter';
import { LoggerService } from './infra/logger/service';
import { IRoutes } from './interfaces/routes';
import { errorHandler } from './middlewares/error';
import { infraMiddleware } from './middlewares/infra';
import { loggerMiddleware } from './middlewares/logger';
import { Middleware } from './utils/types/controller';

class App {
  public app: express.Application;
  public config!: IConfigAdapter;
  public logger!: ILoggerAdapter;
  public redis!: ICacheAdapter;
  public memory!: ICacheAdapter;
  public database!: IDataBaseService<typeof mongoose, ConnectionModel>;

  constructor(private routes: IRoutes<object>[]) {
    this.config = new ConfigService();
    this.logger = new LoggerService();

    this.redis = new RedisCacheService({ url: this.config.get(Secrets.REDIS_URL) }, this.logger);
    this.memory = new MemoryCacheService(this.logger);

    this.database = new MongoService(this.logger);

    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutesMiddlewares(routes);
  }

  public async listen() {
    const port = this.config.get<number>(Secrets.PORT);
    const host = this.config.get(Secrets.HOST);
    const URI = `http://${host}:${port}`;

    this.app.listen(port, host, () => {
      this.logger.trace({
        message: `    ============== ${bold(this.config.get(Secrets.ENV).toUpperCase())} ==============`,
      });
      this.logger.trace({ message: `🚀 App listening at ${bold(URI)} 🚀` });

      this.logRoutes();
    });

    await this.redis.connect();
    this.memory.connect();

    const connection = this.database.getConnectionString({
      dbName: 'cats',
      host: this.config.get(Secrets.MONGO_HOST),
      port: this.config.get(Secrets.MONGO_PORT),
      pass: this.config.get(Secrets.MONGO_PASSWORD),
      user: this.config.get(Secrets.MONGO_USER),
    });

    await this.database.connect(connection);
  }

  private logRoutes() {
    for (const route of this.routes) {
      this.logger.trace({ message: `${bold(route.constructor.name)} dependencies initialized` });

      const routeMap = route.router.stack.filter(r => r?.route).map(r => r.route);

      for (const r of routeMap) {
        this.logger.trace({
          message: `${route.controller.constructor.name} {${r.path} - ${Object.keys(r.methods).toString().toUpperCase()}}`,
        });
      }
    }
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: this.config.get(Secrets.ORIGIN), credentials: this.config.get(Secrets.CREDENTIALS) }));
    this.app.use(infraMiddleware({ config: this.config, logger: this.logger, http: new HttpService(), redis: this.redis, memory: this.memory }));
    this.app.use(loggerMiddleware as Middleware);
  }

  private initializeRoutesMiddlewares(routes: IRoutes<unknown>[]) {
    for (const route of routes) {
      this.app.use('/', route.router);
      this.initializeErrorMiddleware(route);
    }
  }

  private initializeErrorMiddleware(route: IRoutes<unknown>) {
    route.router.use(errorHandler as unknown as Middleware);
  }
}

export default App;
