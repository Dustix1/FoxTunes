import chalk from "chalk";
import { Keys } from "../keys.js";

export default function logMessage(message: any) {
    console.log(`${chalk.hex(Keys.mainColor).bold('FoxTunes')} >> ${chalk.grey(`${message}`)}`);
}