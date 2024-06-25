import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandMessage = {
    slash: false,
    name: 'disconnect',
    aliases: ['dc'],
    usage: '\`\`!disconnect\nNo available arguments\`\`',
    description: 'Disconnects the bot from the voice channel.',
    group: 'musicPlayback',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            if (!player) {
                embed.setColor(Colors.Red);
                embed.setDescription("There is nothing playing in this guild! Play a song by using `/play` or `!play`");
                message.reply({ embeds: [embed] });
                return false;
            }
            if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must be in the same voice channel as me to use this command. I'm in <#${message.guild?.members.me?.voice.channelId}>`);
                message.reply({ embeds: [embed] });
                return false;
            }

        editFromCommand('disconnect', message);
        embed.setDescription('Disconnected from the voice channel.');
        message.channel.send({ embeds: [embed] });
    }
}