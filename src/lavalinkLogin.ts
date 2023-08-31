import { LavalinkManager } from 'lavalink-client';
import client from './clientLogin.js';
import Keys from './keys.js';

client.lavalink = new LavalinkManager({
    nodes: [
        {
            authorization: Keys.lavalinkPassword,
            host: 'localhost',
            port: 2333,
            id: 'mainnode',
        }
    ],
    sendToShard: (id, packet) =>
        client.guilds.cache.get(id)?.shard?.send(packet),
    client: {
        id: Keys.clientID,
        username: 'PiechHarmonix',
    },
    autoSkip: true,
    playerOptions: {
        onEmptyQueue: {
            destroyAfterMs: 60000,
        }
    },
    queueOptions: {
        maxPreviousTracks: 25,
    }
});

client.on("raw", d => client.lavalink.sendRawData(d));
client.on("ready", async () => await client.lavalink.init({ ...client.user! }));