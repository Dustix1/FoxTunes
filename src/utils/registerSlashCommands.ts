import { REST, Routes } from 'discord.js';
import { commandsSlash } from './commands.js';
import Keys from '../keys.js';
import client from '../clientLogin.js';
import logMessage from './logMessage.js';

export default function registerCommands() {
    const rest = new REST().setToken(Keys.clientToken);
    let i = 0;
    let commands: any[] = [];

    commandsSlash.forEach(command => {
        commands.push(command.data.toJSON());
    });

    client.guilds.cache.forEach(guild => {
        rest.put(Routes.applicationGuildCommands(Keys.clientID, guild.id), { body: commands })
    })
}