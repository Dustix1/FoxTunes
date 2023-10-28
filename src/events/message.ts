import { Events } from 'discord.js';
import { commandsMessage } from '../utils/commands.js';
import chalk from 'chalk';
import logMessage from '../utils/logMessage.js';
import { Keys } from '../keys.js';

export const event = {
    name: Events.MessageCreate,
    async execute(message: any) {
        if (message.author.bot) return;
        if (!message.content.startsWith(Keys.prefix)) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!commandsMessage.has(command)) return;
        
        try {
            logMessage(chalk.hex(Keys.secondaryColor).bold(`${message.author.username}`) + ` used ` + chalk.hex(Keys.secondaryColor).bold(`${message}`) + ` on ` + chalk.hex(Keys.secondaryColor).bold(`${message.guild.name} `) + chalk.hex(Keys.secondaryColor).bold(`(${message.guild.id})`));

            await commandsMessage.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('there was an error trying to execute that command!');
        }
    }
}