import chalk from "chalk";
import { Keys } from "../keys.js";

let date = new Date();

export default function logMessage(message: any, debug: boolean = false) {
    if (debug === false) {
        console.log(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes`)} >> ${chalk.grey(`${message}`)}`);
    }else if (Keys.mode === 'development') {
        console.log(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes ${chalk.magenta.bold('[DEBUG]')}`)} >> ${chalk.grey(`${message}`)}`);
    }
    
}