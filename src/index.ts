import chalk from 'chalk';
import { Keys } from './keys.js';

console.log(chalk.hex(Keys.secondaryColor)('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'));
console.log(chalk.hex(Keys.mainColor).bold('    ► Initiating startup sequence... ◄    '));
console.log(chalk.hex(Keys.secondaryColor)('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'));

import('./utils/spinners.js');
import('./lavalinkLogin.js');
import('./utils/events.js');
import('./clientLogin.js');
