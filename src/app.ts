import cors from 'cors';
import express from 'express';
import { ConfigService, IConfigAdapter, Secrets } from './infra/config';
import { IRoutes } from './intercafes/routes';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public config!: IConfigAdapter;

  constructor(routes: IRoutes[]) {
    this.app = express();
    this.env = 'dev';
    this.port = 3000;
    this.config = new ConfigService()

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      // logger.info(`=================================`);
      // logger.info(`======= ENV: ${this.env} =======`);
      // logger.info(`🚀 App listening on the port ${this.port}`);
      // logger.info(`=================================`);
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

  private initializeRoutes(routes: IRoutes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  // private initializeErrorHandling() {
  //   this.app.use(errorMiddleware);
  // }
}

export default App;
