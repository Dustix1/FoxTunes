import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import alertsModel from "../../models/alerts.js";
import alertReadModel from "../../models/alertRead.js";
import { checkIfAlertsRead, countUnreadAlerts } from "../../utils/alertHandler.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandSlash = {
    slash: true,
    group: 'support',
    usage: '\`\`/alerts\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('alerts')
        .setDescription('Lists alerts.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let embed = new EmbedBuilder()
            .setColor(Colors.Blurple);

        const alerts = await alertsModel.find();
        await checkIfAlertsRead(interaction.user.id)
        const alertRead = await alertReadModel.findOne({ userId: interaction.user.id });
        const alertCount = await countUnreadAlerts(interaction.user.id);

        if (alertRead) {
            if (alertCount == 1) {
                alertRead.alerts!.forEach((read, alertId) => {
                    const alert = alerts.find(alert => alert._id as unknown as string == alertId);
                    if (alert && !read) {
                        embed.setDescription(alert.alertEmbedDesc);
                        try {
                            alertRead.alerts!.set(alertId, true);
                            alertRead.save();
                        } catch (error) {
                            logMessage(error, false, "error");
                            embed.setColor(Colors.Red);
                            embed.setDescription('Failed to mark alert as read.');
                            return interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                        return interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                });
            } else if (alertCount > 1) {
                let oldestAlert = alerts[0];
                let firstLoop = true;
                alertRead.alerts!.forEach((read, alertId) => {
                    const alert = alerts.find(alert => alert._id as unknown as string == alertId);
                    if (alert && !read) {
                        if (firstLoop) {
                            firstLoop = false;
                            oldestAlert = alert;
                        }
                        if (alert?.dateCreated.getMilliseconds()! < oldestAlert!.dateCreated.getMilliseconds()) {
                            oldestAlert = alert;
                        }
                    }
                });
                try {
                    alertRead.alerts!.set(oldestAlert._id as unknown as string, true);
                    alertRead.save();
                } catch (error) {
                    logMessage(error, false, "error");
                    embed.setColor(Colors.Red);
                    embed.setDescription('Failed to mark alert as read.');
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
                embed.setDescription(oldestAlert.alertEmbedDesc);
                        embed.setFooter({ text: `You still have ${alertCount - 1} more unread alerts. Read them by using /alerts again` });
                        return interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                embed.setTitle('You have no alerts!');
                embed.setColor(Colors.Blue);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else {
            embed.setDescription('You have no alerts!');
            embed.setColor(Colors.Blue);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}