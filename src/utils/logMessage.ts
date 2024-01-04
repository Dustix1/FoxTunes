import chalk from "chalk";
import { Keys } from "../keys.js";

export default function logMessage(message: any, debug: boolean = false, type?: 'warn' | 'error') {
    let date = new Date();
    if (!debug) {
        if (type === 'warn') {
            return console.warn(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes ${chalk.yellow.bold('[WARN]')}`)} >> ${chalk.yellow.bold(`${message}`)}`);
        } else if (type === 'error'){
            return console.error(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes ${chalk.red.bold('[ERROR]')}`)} >> ${chalk.red.bold(`${message}`)}`);
        }
        console.log(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes`)} >> ${chalk.grey(`${message}`)}`);
    }else if (Keys.mode === 'development') {
        if (type === 'warn') {
            return console.warn(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes ${chalk.yellow.bold('[WARN]')} ${chalk.magenta.bold('[DEBUG]')}`)} >> ${chalk.yellow.bold(`${message}`)}`);
        } else if (type === 'error'){
            return console.error(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes ${chalk.red.bold('[ERROR]')} ${chalk.magenta.bold('[DEBUG]')}`)} >> ${chalk.red.bold(`${message}`)}`);
        }
        console.log(`${chalk.hex(Keys.mainColor).bold(`[${date.toTimeString().split(' ')[0]}] FoxTunes ${chalk.magenta.bold('[DEBUG]')}`)} >> ${chalk.grey(`${message}`)}`);
    }
    
}