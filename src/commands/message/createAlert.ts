import { Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, GuildMember } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import alertsModel from "../../models/alerts.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandMessage = {
    slash: false,
    name: 'createalert',
    usage: '\`\`!createalert\nAvailable arguments: alert_title alert_desc\`\`',
    description: 'Create a new alert.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        if (message.author.id !== Keys.ownerID) return;

        const desc = message.content.split(' ').slice(1).join(' ');

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept')
            .setEmoji('✔️')
            .setStyle(ButtonStyle.Success);

        const denyButton = new ButtonBuilder()
            .setCustomId('deny')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger);

        let alertEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setDescription(desc);

        let row = new ActionRowBuilder().addComponents([denyButton, acceptButton]);

        const msg = await message.channel.send({ embeds: [alertEmbed], components: [row as any] });
        const collector = msg!.createMessageComponentCollector({ componentType: ComponentType.Button });


        collector.on('collect', async interaction => {
            if (interaction.customId === 'accept') {
                try {
                    alertsModel.create({
                        alertEmbedDesc: desc
                    });
                } catch (error) {
                    interaction.reply({ content: 'Alert creation failed.' });
                    logMessage(error, false, "error");
                }
                interaction.reply({ content: 'Alert created successfully.' });
                collector.stop();
            } else if (interaction.customId === 'deny') {
                interaction.reply({ content: 'Alert creation cancelled.' });
                collector.stop();
            }
        });
    }
}
