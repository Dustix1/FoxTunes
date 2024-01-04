import { Manager } from 'magmastream';
import client from './clientLogin.js';
import Keys from './keys.js';
import CustomManager from './mixins/customManagerCreate.js';

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

client.manager = new CustomManager({
    nodes,
    send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
});

client.on('raw', (d) => client.manager.updateVoiceState(d));