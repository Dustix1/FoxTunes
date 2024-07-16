import { Message, EmbedBuilder, TextChannel, Colors, User } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'delete',
    usage: '\`\`!delete\nNo available arguments\`\`',
    description: 'Deletes an issue or suggestion.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Colors.Red);

        if (message.guild?.id !== Keys.foxtunesGuildID) return;
        if (message.author.id !== Keys.ownerID) return;

        const textChannel = message.channel as TextChannel;
        await message.channel.delete();

        const foxTunesGuild = await client.guilds.fetch(Keys.foxtunesGuildID);
        const logChannel = await foxTunesGuild.channels.fetch('1262881636442439841').catch(() => null) as TextChannel;

        const member = await foxTunesGuild.members.fetch(textChannel.topic!.split('-')[1]).catch(() => null);

        if (logChannel) {
            embed.setTitle('An issue or suggestion has been deleted.')
                .setDescription(textChannel.name)
                .setFooter({ text: textChannel.topic! });
            member ? embed.setAuthor({ name: textChannel.name.split('-')[0], iconURL: (member!.user as User).avatarURL()! }) : embed.setAuthor({ name: textChannel.name.split('-')[0] })
            await logChannel.send({ embeds: [embed] });
        }
    }
}