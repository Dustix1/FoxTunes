import { Message, EmbedBuilder, TextChannel, Colors, User } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'deny',
    usage: '\`\`!deny\nAvailable arguments: deny_message\`\`',
    description: 'Denies an issue or suggestion.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Colors.Red);

        if (!message.inGuild()) return;
        if (message.guild?.id !== Keys.foxtunesGuildID) return;
        if (message.author.id !== Keys.ownerID) return;

        message.delete();
        const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
        const textChannel = message.channel as TextChannel;

        const member = await foxTunesGuild.members.fetch(textChannel.topic!.split('-')[1]).catch(() => null);

        if (textChannel.topic?.split('-')[0] == 'issue') {
            embed.setTitle('The issue has been rejected.');
            if (args[0]) embed.setDescription(message.content.split(' ').slice(1).join(' '));
            embed.setFooter({ text: 'We were unable to reproduce or resolve the issue.' });

            message.channel.send({ content: `<@${textChannel.topic.split('-')[1]}>` });
            message.channel.send({ embeds: [embed] });

            if (member) textChannel.permissionOverwrites.edit(member.id, { SendMessages: false });

            const logChannel = await foxTunesGuild.channels.fetch('1262881636442439841').catch(() => null) as TextChannel;
            if (logChannel) {
                embed.setTitle('An issue has been rejected.')
                    .setDescription(textChannel.url)
                    .setFooter({ text: textChannel.topic.split('-')[1] });
                member ? embed.setAuthor({ name: textChannel.name.split('-')[0], iconURL: (member!.user as User).avatarURL()! }) : embed.setAuthor({ name: textChannel.name.split('-')[0] })
                await logChannel.send({ embeds: [embed] });
            }
        } else {
            embed.setTitle('The suggestion was rejected.');
            if (args[0]) embed.setDescription(message.content.split(' ').slice(1).join(' '));
            embed.setFooter({ text: 'We appreciate your suggestion; however, we regret to inform you that it wasn\'t approved.' });

            message.channel.send({ content: `<@${textChannel.topic!.split('-')[1]}>` });
            message.channel.send({ embeds: [embed] });

            if (member) textChannel.permissionOverwrites.edit(textChannel.topic!.split('-')[1], { SendMessages: false });

            const logChannel = await foxTunesGuild.channels.fetch('1262881636442439841').catch(() => null) as TextChannel;
            if (logChannel) {
                embed.setTitle('A suggestion has been rejected.')
                    .setDescription(textChannel.url)
                    .setFooter({ text: textChannel.topic! });
                member ? embed.setAuthor({ name: textChannel.name.split('-')[0], iconURL: (member!.user as User).avatarURL()! }) : embed.setAuthor({ name: textChannel.name.split('-')[0] })
                await logChannel.send({ embeds: [embed] });
            }
        }
    }
}