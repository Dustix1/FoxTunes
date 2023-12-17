import ora from 'ora';
import chalk from 'chalk';
import cliSpinners from 'cli-spinners';
import { Keys } from '../keys.js';

export const spinnerMongodbLogin = ora(chalk.hex(Keys.secondaryColor)('Connecting to the Database...'));
spinnerMongodbLogin.color = 'yellow';
spinnerMongodbLogin.spinner = cliSpinners.dots;
spinnerMongodbLogin.start();

export const spinnerDiscordLogin = ora(chalk.hex(Keys.secondaryColor)('Logging into Discord...'));

spinnerDiscordLogin.color = 'yellow';
spinnerDiscordLogin.spinner = cliSpinners.line;

export const spinnerLavalinkLogin = ora(chalk.hex(Keys.secondaryColor)('Connecting to Lavalink...'));

spinnerLavalinkLogin.color = 'yellow';
spinnerLavalinkLogin.spinner = cliSpinners.bouncingBar;