import { bold } from 'colorette';
import cors from 'cors';
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
    this.config = new ConfigService();
    this.logger = new LoggerService();

    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // this.initializeErrorHandling();
  }

  public listen() {
    const port = this.config.get<number>(Secrets.PORT);
    const host = this.config.get(Secrets.HOST);
    const URI = `http://${host}:${port}`;

    this.app.listen(port, host, () => {
      this.logger.trace({ message: `   ============ ${bold(this.config.get(Secrets.ENV).toUpperCase())} =============\n` });
      this.logger.trace({ message: `🚀 App listening at ${bold(URI)} 🚀` });
    });
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: this.config.get(Secrets.ORIGIN), credentials: this.config.get(Secrets.CREDENTIALS) }));
  }

  private initializeRoutes(routes: IRoutes<unknown>[]) {
    for (const route of routes) {
      this.app.use('/', route.router);
    }
  }

  // private initializeErrorHandling() {
  //   this.app.use(errorMiddleware);
  // }
}

export default App;
