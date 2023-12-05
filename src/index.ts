import chalk from 'chalk';
import { Keys } from './keys.js';

console.log(chalk.hex(Keys.secondaryColor)('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'));
console.log(chalk.hex(Keys.mainColor).bold('    ► Initiating startup sequence... ◄    '));
console.log(chalk.hex(Keys.secondaryColor)('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'));

if(Keys.mode === "development") {
    console.log(chalk.magenta('    ╔══════════════════════════╗    '));
    console.log(chalk.magenta(`    ╠     ${chalk.bold("Development mode")}     ╣    `));
    console.log(chalk.magenta('    ╚══════════════════════════╝    '));
}

import('./utils/spinners.js');
import('./lavalinkLogin.js');
import('./utils/events.js');
import('./clientLogin.js');