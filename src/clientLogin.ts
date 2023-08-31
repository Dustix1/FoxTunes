import { Client, GatewayIntentBits } from 'discord.js';
import Keys from './keys.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
}) as Client & { lavalink: any };

client.login(Keys.clientToken)
.catch((err) => {
    console.error('error logging in: ', err);
    process.exit(1);
}).finally(() => {
    console.log('logged in');
});

export default client;