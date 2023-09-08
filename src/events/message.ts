import { Events } from 'discord.js';
import { commandsMessage } from '../utils/commands.js';

export const event = {
    name: Events.MessageCreate,
    async execute(message: any) {
        if (message.author.bot) return;
        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!commandsMessage.has(command)) return;
        
        try {
            commandsMessage.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('there was an error trying to execute that command!');
        }
    }
}