import ora from 'ora';
import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import { Keys } from '../keys.js';

export const spinnerDiscordLogin = ora(chalk.hex(Keys.secondaryColor)('Logging into Discord...'));

spinnerDiscordLogin.color = 'yellow';
spinnerDiscordLogin.spinner = cliSpinners.line;
spinnerDiscordLogin.start();

export const spinnerLavalinkLogin = ora(chalk.hex(Keys.secondaryColor)('Connecting to Lavalink...'));

spinnerLavalinkLogin.color = 'yellow';
spinnerLavalinkLogin.spinner = cliSpinners.bouncingBar;