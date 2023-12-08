import { Manager } from 'magmastream';
import client from './clientLogin.js';
import Keys from './keys.js';
import { ClientPresence } from 'discord.js';

const nodes = [
    {
        host: 'localhost',
        identifier: 'main',
        password: Keys.lavalinkPassword,
        port: 2334,
        retryDelay: 5000,
        retryAmount: 500,
    }
];

client.manager = new Manager({
    nodes,
    send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
});

export const lavalinkConnectionStatus = {
    isLavalinkConnected: false,
    isStandby: false,
}

client.on('raw', (d) => client.manager.updateVoiceState(d));