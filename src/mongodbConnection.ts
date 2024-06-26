import mongoose from "mongoose";
import { spinnerDiscordLogin, spinnerMongodbLogin } from "./utils/spinners.js";
import chalk from "chalk";
import Keys from "./keys.js";
import { clientConnectionStatus } from "./clientLogin.js";

mongoose.set('strictQuery', true);
await mongoose.connect(process.env.MONGODB_URI!, {
    auth: {
        username: Keys.mongodbUsername,
        password: Keys.mongodbPassword
    }
}).then(() => {
    spinnerMongodbLogin.succeed(chalk.green('Database connection successful!'));
    spinnerDiscordLogin.start();
    clientConnectionStatus.isStandby = false;
    clientConnectionStatus.isMongoDBConnected = true;
}).catch((err) => {
    console.error(err);
    spinnerMongodbLogin.fail(chalk.red('Database connection failed!'));
    process.exit(1);
});