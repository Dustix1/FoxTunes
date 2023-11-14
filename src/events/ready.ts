import { Events, ActivityType } from 'discord.js';
import { spinnerDiscordLogin, spinnerLavalinkLogin } from '../utils/spinners.js';
import registerCommands from '../utils/registerSlashCommands.js';
import client from '../clientLogin.js';
import chalk from 'chalk';

export const event = {
    name: Events.ClientReady,
    async execute() {
        client.manager.init(client.user?.id);

        (async () => {
            await import('../utils/commands.js');
            await registerCommands();
            await spinnerDiscordLogin.succeed(chalk.green(`Discord login successful!`));
        })();

        client.user?.setPresence({
            activities: [{ name: '/help', type: ActivityType.Listening }],
            status: 'online',
        })
    }
}