import mongoose from "mongoose";
import { spinnerDiscordLogin, spinnerMongodbLogin } from "./utils/spinners.js";
import chalk from "chalk";

mongoose.set('strictQuery', true);
await mongoose.connect(process.env.MONGODB_URI!).then(() => {
    spinnerMongodbLogin.succeed(chalk.green('Database connection successful!'));
    spinnerDiscordLogin.start();
}).catch((err) => {
    console.error(err);
});