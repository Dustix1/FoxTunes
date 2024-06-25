import { REST, Routes } from 'discord.js';
import { commandsSlash } from './commands.js';
import Keys from '../keys.js';

export default function registerCommands() {
    const rest = new REST().setToken(Keys.clientToken);
    let i = 0;
    let commands: any[] = [];

    commandsSlash.forEach(command => {
        commands.push(command.data.toJSON());
    });

    rest.put(Routes.applicationCommands(Keys.clientID), { body: commands })
}