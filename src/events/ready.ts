import { Events } from 'discord.js';

export const event = {
    name: Events.ClientReady,
    async execute() {
        console.log('logged in');
        import('../utils/commands.js');
        (async () => {
            await import('../utils/registerSlashCommands.js');
        })();
    }
}