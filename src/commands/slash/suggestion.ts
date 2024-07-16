import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction, CategoryChannel, ChannelType, PermissionOverwrites, PermissionsBitField, PermissionFlagsBits, Colors, TextChannel, User } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/suggestion\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Suggest a feature for the bot.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const modal = new ModalBuilder()
            .setCustomId(`${interaction.member?.user.id}-suggestFeature`)
            .setTitle('Suggest a feature')

        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("Enter a title for the suggestion")
            .setStyle(TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(50)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('suggestionText')
            .setLabel("Describe the suggestion")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(10)
            .setMaxLength(1000)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descriptionInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    }
}

export async function reactToSuggestionModal(interaction: ModalSubmitInteraction, userID: string) {
    let embed = new EmbedBuilder()
        .setColor(Keys.secondaryColor)
        .setTitle('Suggestion sent to the FoxTunes development team')
        .setDescription('Thank you for suggesting a feature. We will look into it as soon as possible.');

    interaction.reply({ embeds: [embed], ephemeral: true });

    const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
    const category = await foxTunesGuild.channels.fetch('1262853729724534835') as CategoryChannel;
    const channel = await category!.children.create({
        type: ChannelType.GuildText,
        name: `${interaction.member?.user.username}--${interaction.fields.getField('titleInput').value}`,
        topic: `suggestion-${userID}`,
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
        .setColor(Keys.mainColor)
        .setTitle(interaction.fields.getField('titleInput').value)
        .setDescription(`${interaction.fields.getField('suggestionText').value}`)

    await channel.send({ embeds: [embed] });

    const logChannel = await foxTunesGuild.channels.fetch('1262881636442439841').catch(() => null) as TextChannel;
    if (logChannel) {
        embed.setTitle('A new suggestion has been submitted')
             .setDescription(channel.url)
             .setAuthor({ name: interaction.member!.user.username, iconURL: (interaction.member!.user as User).avatarURL()! })
             .setFooter({ text: `${userID}` });
        await logChannel.send({ embeds: [embed] });
        await logChannel.send({ content: `<@${Keys.ownerID}>` });
    }

    const member = await foxTunesGuild.members.fetch(userID).catch(() => null);
    embed = new EmbedBuilder()
    if (member) {
        embed
            .setColor(Colors.Green)
            .setTitle(`Your suggestion has been sent to the FoxTunes support server. You can view it here: ${channel.url}`)
    } else {
        embed
            .setColor(Keys.secondaryColor)
            .setDescription('## It appears you are not in the FoxTunes support server. You can join [here](https://discord.gg/TJ9XjTuV5N)\nTo view your suggestion, you will need to join the server.')
    }

    await interaction.followUp({ embeds: [embed], ephemeral: true });
}