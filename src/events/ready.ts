import { Events } from 'discord.js';
import { spinnerDiscordLogin, spinnerLavalinkLogin } from '../utils/spinners.js';
import chalk from 'chalk';
import client from '../clientLogin.js';

export const event = {
    name: Events.ClientReady,
    async execute() {
        spinnerDiscordLogin.succeed(chalk.green(`Discord login successful!`));
        spinnerLavalinkLogin.start();

        client.manager.init(client.user?.id);

        import('../utils/commands.js');
        (async () => {
            await import('../utils/registerSlashCommands.js');
        })();
    }
}