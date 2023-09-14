import ora from 'ora';
import chalk from 'chalk';
import cliSpinners from 'cli-spinners';

export const spinnerDiscordLogin = ora(chalk.cyanBright('Logging into Discord...'));

spinnerDiscordLogin.color = 'yellow';
spinnerDiscordLogin.spinner = cliSpinners.line;
spinnerDiscordLogin.start();

export const spinnerLavalinkLogin = ora(chalk.cyanBright('Connecting to Lavalink...'));

spinnerLavalinkLogin.color = 'yellow';
spinnerLavalinkLogin.spinner = cliSpinners.bouncingBar;