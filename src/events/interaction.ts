import { Events, Interaction } from 'discord.js';
import { commandsSlash } from '../utils/commands.js';
import chalk from 'chalk';
import logMessage from '../utils/logMessage.js';
import { Keys } from '../keys.js';

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.commandName;

        if (!commandsSlash.has(command)) return;

        try {
            logMessage(chalk.hex(Keys.secondaryColor).bold(`${interaction.user.username}`) + ` used ` + chalk.hex(Keys.secondaryColor).bold(`${interaction}`) + ` on ` + chalk.hex(Keys.secondaryColor).bold(`${interaction.guild?.name} `) + chalk.hex(Keys.secondaryColor).bold(`(${interaction.guild?.id})`));

            commandsSlash.get(command).execute(interaction, interaction.options);
        } catch (error) {
            console.error(error);
            await interaction.reply('there was an error trying to execute that command!');
        }
    }
}