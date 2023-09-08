import { REST, Routes } from 'discord.js';
import { commandsSlash } from './commands.js';
import Keys from '../keys.js';
import client from '../clientLogin.js';

const rest = new REST().setToken(Keys.clientToken);

let i = 0;
const commands: any[] = [];

commandsSlash.forEach(command => {
    commands.push(command.data.toJSON());
});

client.guilds.cache.forEach(guild => {
    console.log(`Refreshing commands for guild ${guild.name} [${guild.id}] (${i + 1}/${client.guilds.cache.size})`);
    rest.put(Routes.applicationGuildCommands(Keys.clientID, guild.id), { body: commands })
})