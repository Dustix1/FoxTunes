import { Events } from 'discord.js';
import { commandsSlash } from '../utils/commands.js';

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (!interaction.isCommand()) return;

        const command = interaction.commandName;

        if (!commandsSlash.has(command)) return;

        try {
            commandsSlash.get(command).execute(interaction, interaction.options);
        } catch (error) {
            console.error(error);
            await interaction.reply('there was an error trying to execute that command!');
        }
    }
}