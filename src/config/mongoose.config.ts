/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
import mongoose,{ ConnectOptions } from 'mongoose';
const util = require('util');
interface CustomConnectOptions extends ConnectOptions {
  useUnifiedTopology?: boolean;
}
export default class MongooseConfig {

    constructor() {
        if (process.env.DB) {
            mongoose
              .connect(process.env.DB, {
                // @ts-ignore
                useUnifiedTopology: true,
                useNewUrlParser: true
              })
              .then(() => console.log('DB Connected...'))
              .catch((err) => {
               console.log(
                 'DB Connection Error:',
                 util.inspect(err, false, null, true)
               );
                console.log(`DB Connection Error: ${err.message}`);
              });
        } else {
            console.log('DB Connection string not configured.');
        }
    }
}
