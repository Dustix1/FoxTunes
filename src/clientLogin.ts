import { Client, GatewayIntentBits } from 'discord.js';
import Keys from './keys.js';
import { spinnerDiscordLogin } from './utils/spinners.js';
import chalk from 'chalk';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
}) as Client & { manager: any };

client.login(Keys.clientToken)
.catch((err) => {
    spinnerDiscordLogin.fail(chalk.red.bold(`Discord login failed! --> ${err.message}`));
    process.exit(1);
})

export default client;