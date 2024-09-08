import { Message, EmbedBuilder, TextChannel, Colors, User } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'archive',
    usage: '\`\`!archive\nNo available arguments\`\`',
    description: 'Archives an issue or suggestion.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Keys.secondaryColor);

        if (!message.inGuild()) return;
        if (message.guild?.id !== Keys.foxtunesGuildID) return;
        if (message.author.id !== Keys.ownerID) return;

        const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
        const logChannel = await foxTunesGuild.channels.fetch('1262881636442439841').catch(() => null) as TextChannel;
        const textChannel = message.channel as TextChannel;
        const member = await foxTunesGuild.members.fetch(textChannel.topic!.split('-')[1]).catch(() => null);

        if (textChannel.topic?.split('-')[0] == 'issue') {
            embed.setTitle('The issue has been archived.');
            await message.channel.send({ embeds: [embed] });
            await textChannel.setParent('1262853652029374615');
        } else {
            embed.setTitle('The suggestion has been archived.');
            await message.channel.send({ embeds: [embed] });
            await textChannel.setParent('1262853793595392010');
        }

        if (member) textChannel.permissionOverwrites.edit(member.id, { ViewChannel: false, SendMessages: false });

        if (logChannel) {
            embed.setTitle('An issue or suggestion has been archived.')
                .setDescription(textChannel.url)
                .setFooter({ text: textChannel.topic!.split('-')[1] });
            member ? embed.setAuthor({ name: textChannel.name.split('-')[0], iconURL: (member!.user as User).avatarURL()! }) : embed.setAuthor({ name: textChannel.name.split('-')[0] })
            await logChannel.send({ embeds: [embed] });
        }
    }
}