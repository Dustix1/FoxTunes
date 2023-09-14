import { Manager } from 'magmastream';
import client from './clientLogin.js';
import Keys from './keys.js';
import chalk from 'chalk';
import { spinnerLavalinkLogin } from './utils/spinners.js';

const nodes = [
    {
        host: 'localhost',
        identifier: 'main',
        password: Keys.lavalinkPassword,
        port: 2333
    }
];

client.manager = new Manager({
    nodes,
    send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
});

client.manager.on('nodeConnect', () => {
    spinnerLavalinkLogin.succeed(chalk.green(`Lavalink connection established!`));
});

client.manager.on('nodeError', (node: any, error: any) => {
    spinnerLavalinkLogin.fail(chalk.red.bold(`Lavalink connection failed! --> ${error.message}`));
    process.exit(1);
});

client.on('raw', (d) => client.manager.updateVoiceState(d));