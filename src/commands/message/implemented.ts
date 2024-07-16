import { Message, EmbedBuilder, TextChannel, Colors, User } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'implemented',
    usage: '\`\`!implemented\nNo available arguments\`\`',
    description: 'Marks a suggestion as implemented.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Colors.Green);

        if (message.guild?.id !== Keys.foxtunesGuildID) return;
        if (message.author.id !== Keys.ownerID) return;

        message.delete();
        const textChannel = message.channel as TextChannel;

        const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
        const logChannel = await foxTunesGuild.channels.fetch('1262881636442439841').catch(() => null) as TextChannel;

        const member = await foxTunesGuild.members.fetch(textChannel.topic!.split('-')[1]).catch(() => null);

        embed.setTitle('The suggestion has been marked as implemented.')
            .setDescription('Thank you for your contribution.')
        message.channel.send({ content: `<@${textChannel.topic!.split('-')[1]}>` });
        await textChannel.send({ embeds: [embed] });

        if (logChannel) {
            embed.setTitle('A suggestion has been marked as implemented.')
                .setDescription(textChannel.name)
                .setFooter({ text: textChannel.topic! });
            member ? embed.setAuthor({ name: textChannel.name.split('-')[0], iconURL: (member!.user as User).avatarURL()! }) : embed.setAuthor({ name: textChannel.name.split('-')[0] })
            await logChannel.send({ embeds: [embed] });
        }
    }
}