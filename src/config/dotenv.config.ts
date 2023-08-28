import { config } from "dotenv";

// class for loading the .env config file
export default class DotEnvConfig {
    constructor() {
        const result = config();
        if (result && result.error) {
            console.log(`Error trying to load the config file: ${result.error}`);
            return;
        }
        console.log(`Config file loaded successfully.`);
    }
}
