import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction, CategoryChannel, ChannelType, PermissionOverwrites, PermissionsBitField, PermissionFlagsBits } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/report-issue\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('report-issue')
        .setDescription('Report an issue with the bot.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const modal = new ModalBuilder()
            .setCustomId(`${interaction.member?.user.id}-issueReport`)
            .setTitle('Report an issue')

        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("Enter a title for the issue")
            .setStyle(TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(50)
            .setRequired(true);

        const severityInput = new TextInputBuilder()
            .setCustomId('severityInput')
            .setLabel("Enter the severity of the issue")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("\"Low\", \"Medium\", \"High\"")
            .setMinLength(3)
            .setMaxLength(6)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('issueText')
            .setLabel("Describe the issue")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(10)
            .setMaxLength(1000)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(severityInput);
        const thirdActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descriptionInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
    }
}

export async function reactToModal(interaction: ModalSubmitInteraction, userID: string) {
    let embed = new EmbedBuilder()
        .setColor(Keys.secondaryColor)
        .setTitle('Issue Reported')
        .setDescription('Thank you for reporting the issue. We will look into it as soon as possible.');

    interaction.reply({ embeds: [embed], ephemeral: true });

    const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
    const category = await foxTunesGuild.channels.fetch('1262502735220178955') as CategoryChannel;
    const channel = await category!.children.create({
        type: ChannelType.GuildText,
        name: `${interaction.member?.user.username}--${interaction.fields.getField('titleInput').value}`,
        topic: userID,
        rateLimitPerUser: 5,
        permissionOverwrites: [{
            id: foxTunesGuild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }, {
            id: userID,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }]
    });

    embed = new EmbedBuilder()
    let severity = interaction.fields.getField('severityInput').value;
    switch (severity.toLowerCase()) {
        case 'low':
            severity = '# -# Low Severity';
            embed.setColor('#fdc500');
            break;
        case 'medium':
            severity = '# -# Medium Severity';
            embed.setColor('#fd8c00');
            break;
        case 'high':
            severity = '# -# High Severity';
            embed.setColor('#dc0000');
            break;
        default:
            severity = `# -# ${severity}`;
            embed.setColor('#fd8c00');
            break;
    }

    embed
        .setTitle(interaction.fields.getField('titleInput').value)
        .setDescription(`${severity}\n${interaction.fields.getField('issueText').value}`)

    await channel.send({ embeds: [embed] });

    embed = new EmbedBuilder()
    if (foxTunesGuild.members.resolve(userID)) {
        embed
            .setColor(Keys.mainColor)
            .setTitle(`You can track the issue status here:\n${channel.url}`)
    } else {
        embed
            .setColor(Keys.mainColor)
            .setTitle(`It appears you are not in the FoxTunes support server. You can join here: https://discord.gg/TJ9XjTuV5N`)
    }

    await interaction.followUp({ embeds: [embed], ephemeral: true });
}