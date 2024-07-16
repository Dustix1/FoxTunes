import { Message, EmbedBuilder, TextChannel, Colors } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'resolve',
    usage: '\`\`!resolve\nAvailable arguments: resolve_message\`\`',
    description: 'Resolves an issue or suggestion.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Colors.Green);

        if (message.guild?.id !== Keys.foxtunesGuildID) return;
        if (message.author.id !== Keys.ownerID) return;

        message.delete();
        const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
        const textChannel = message.channel as TextChannel;

        const member = await foxTunesGuild.members.fetch(textChannel.topic!.split('-')[1]).catch(() => null);

        if (textChannel.topic?.split('-')[0] == 'issue') {
            embed.setTitle('The issue has been resolved.');
            if (args[0]) embed.setDescription(args[0]);
            embed.setFooter({ text: 'Thank you for reporting the issue.' });

            message.channel.send({ content: `<@${textChannel.topic.split('-')[1]}>` });
            message.channel.send({ embeds: [embed] });

            if (member) textChannel.permissionOverwrites.edit(member.id, { SendMessages: false });
        } else {
            embed.setTitle('The suggestion was approved. It will be implemented soon.');
            if (args[0]) embed.setDescription(args[0]);
            embed.setFooter({ text: 'Thank you for your suggestion. We will let you know once the feature is implemented or something changes.' });

            message.channel.send({ content: `<@${textChannel.topic!.split('-')[1]}>` });
            message.channel.send({ embeds: [embed] });

            if (member) textChannel.permissionOverwrites.edit(textChannel.topic!.split('-')[1], { SendMessages: false });
        }
    }
}