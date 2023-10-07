import chalk from "chalk";
import { Keys } from "../keys.js";

let date = new Date();

export default function logMessage(message: any) {
    console.log(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes`)} >> ${chalk.grey(`${message}`)}`);
}