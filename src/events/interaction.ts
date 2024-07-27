import { ChatInputCommandInteraction, Colors, EmbedBuilder, Events, Interaction } from 'discord.js';
import { commandsSlash } from '../utils/commands.js';
import chalk from 'chalk';
import logMessage from '../utils/logMessage.js';
import { Keys } from '../keys.js';
import client from '../clientLogin.js';
import { clientConnectionStatus } from '../clientLogin.js';
import { reactToIssueModal } from '../commands/slash/report-issue.js';
import { reactToSuggestionModal } from '../commands/slash/suggestion.js';
import { checkIfAlertsRead, countUnreadAlerts } from '../utils/alertHandler.js';

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isCommand()) return handleModals(interaction);

        let embed = new EmbedBuilder()
                .setColor(Colors.Red);

        if (interaction.channel === null)
            {
                embed.setDescription('Commands can only be used in a server channel!');
                return interaction.reply({ embeds: [embed] });
            }

        const command = interaction.commandName;

        if (!commandsSlash.has(command)) return;

        
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
            if (!await checkIfAlertsRead(interaction.user.id)) unreadAlerts(interaction as ChatInputCommandInteraction);
            
        } catch (error) {
                embed.setDescription('There was an error trying to execute that command!');
                await interaction.channel.send({ embeds: [embed] });
            console.error(error);
        }
    }
}

async function unreadAlerts(interaction: ChatInputCommandInteraction) {
    const alertCount = await countUnreadAlerts(interaction.user.id);
    if (alertCount === 0 || interaction.commandName == 'alerts') return;
    let embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setDescription(`# You have \`${alertCount}\` unread alerts!\n You can view them by using the \`/alerts\` command.`);
    setTimeout(() => {
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }, 1000);
}

async function handleModals(interaction: Interaction) {
    if (!interaction.isModalSubmit()) return;
    const modal = interaction.customId.split('-');

    switch (modal[1]) {
        case 'issueReport':
            return reactToIssueModal(interaction, modal[0]);
        case 'suggestFeature':
            return reactToSuggestionModal(interaction, modal[0]);
        default:
            return;
    }
}