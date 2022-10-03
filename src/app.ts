import cors from 'cors';
import { bold } from 'colorette';
import express from 'express';
import { ConfigService, IConfigAdapter, Secrets } from './infra/config';
import { ILoggerAdapter } from './infra/logger/adapter';
import { LoggerService } from './infra/logger/service';
import { IRoutes } from './interfaces/routes';

class App {
  public app: express.Application;
  public config!: IConfigAdapter;
  public logger!: ILoggerAdapter;

  constructor(routes: IRoutes<unknown>[]) {
    this.config = new ConfigService()
    this.logger = new LoggerService()

    this.app = express();
  
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.config.get<number>(Secrets.PORT), () => {
      this.logger.trace({ message: `   ============ ${bold(this.config.get<number>(Secrets.ENV))} =============` });
      this.logger.trace({ message: `🚀 App listening on the port ${this.config.get<number>(Secrets.PORT)} 🚀` });
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: this.config.get(Secrets.ORIGIN), credentials: this.config.get(Secrets.CREDENTIALS) }));
  }

  private initializeRoutes(routes: IRoutes<unknown>[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  // private initializeErrorHandling() {
  //   this.app.use(errorMiddleware);
  // }
}

export default App;
