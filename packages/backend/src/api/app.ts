import express from 'express';
import { router } from './routes';
import cors from 'cors';
export class App {
  public server: express.Application;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.server.use(express.json());
    const corsOptions = {
      origin: '*',
      optionsSuccessStatus: 200,
    };

    this.server.use(cors(corsOptions));
  }

  private routes(): void {
    this.server.use(router);
  }
}
