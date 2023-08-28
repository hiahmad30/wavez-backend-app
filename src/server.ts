import DotEnvConfig from './config/dotenv.config';
import ExpressConfig from './config/express.config';
import MongooseConfig from './config/mongoose.config';
import { Application } from 'express';
import CronJobConfig from './config/cron.config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const util = require('util');
export default class Server {
  private app: Application;

  constructor() {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    const PORT: number = parseInt(process.env.PORT || '3002');
    if (process.env.NODE_ENV === 'development') new DotEnvConfig();
    const expressConfig = new ExpressConfig();
    new MongooseConfig();
    new CronJobConfig();
    this.app = expressConfig.getApp();
    this.app.listen(PORT, () => {
      console.log(`Wavez Backend Server started on port ${PORT}`);
    });
  }

  public exportApp() {
    return this.app;
  }
}
try {
  new Server();
} catch (err) {
  console.log(`General Server Error: ${JSON.stringify(err)}`);
}
