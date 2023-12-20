import { Colors, EmbedBuilder, Events, Interaction } from 'discord.js';
import { commandsSlash } from '../utils/commands.js';
import chalk from 'chalk';
import logMessage from '../utils/logMessage.js';
import { Keys } from '../keys.js';
import client from '../clientLogin.js';
import { clientConnectionStatus } from '../clientLogin.js';

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.commandName;

        if (!commandsSlash.has(command)) return;

        let embed = new EmbedBuilder()
                .setColor(Colors.Red);
        try {
            logMessage(chalk.hex(Keys.secondaryColor).bold(`${interaction.user.username}`) + ` used ` + chalk.hex(Keys.secondaryColor).bold(`${interaction}`) + ` on ` + chalk.hex(Keys.secondaryColor).bold(`${interaction.guild?.name} `) + chalk.hex(Keys.secondaryColor).bold(`(${interaction.guild?.id})`));
            let player = client.manager.players.get(interaction.guild!.id);
            if (player) {
                if (interaction.channel!.id != player.textChannel) player.textChannel = interaction.channel!.id;
            }
            if(!clientConnectionStatus.isLavalinkConnected || !clientConnectionStatus.isMongoDBConnected) {
                embed.setDescription('The bot is currently in standby mode. Please try again later.');
                return interaction.reply({ embeds: [embed] });
            }

            await commandsSlash.get(command).execute(interaction, interaction.options);
        } catch (error) {
                embed.setDescription('There was an error trying to execute that command!');
            await interaction.reply({ embeds: [embed] });
            console.error(error);
        }
    }
}