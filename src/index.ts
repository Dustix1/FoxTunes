import chalk from 'chalk';

console.log(chalk.blueBright('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'));
console.log(chalk.cyan('    ► Initiating startup sequence... ◄    '));
console.log(chalk.blueBright('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'));

import('./utils/spinners.js');
import('./utils/events.js');
import('./clientLogin.js');

