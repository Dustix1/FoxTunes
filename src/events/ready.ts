import { Events, ActivityType } from 'discord.js';
import { spinnerDiscordLogin, spinnerLavalinkLogin } from '../utils/spinners.js';
import chalk from 'chalk';
import client from '../clientLogin.js';

export const event = {
    name: Events.ClientReady,
    async execute() {
        spinnerDiscordLogin.succeed(chalk.green(`Discord login successful!`));
        spinnerLavalinkLogin.start();

        (async () => {
            await import('../utils/commands.js');
            await import('../utils/registerSlashCommands.js');
            await import('../lavalinkLogin.js');
            await client.manager.init(client.user?.id);
        })();

        client.user?.setPresence({
            activities: [{ name: '/help', type: ActivityType.Listening }],
            status: 'online',
        })
    }
}