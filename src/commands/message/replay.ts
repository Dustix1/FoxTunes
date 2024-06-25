import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import logMessage from "../../utils/logMessage.js";
import { guildSongPreviousCache } from "../../events/lavalink/trackStart.js";
import { createPlayer } from "../../structures/player.js";
import playSong from "../../utils/playSong.js";

export const command: CommandMessage = {
    slash: false,
    name: 'replay',
    aliases: ['r'],
    usage: '\`\`!replay\nNo available arguments\`\`',
    description: 'Replays the last played song.',
    group: 'musicPlayback',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!message.member?.voice.channel) {
            embed.setColor(Colors.Red);
            embed.setDescription("You must be in a voice channel to use this command!");
            return message.reply({ embeds: [embed] });
        }

        let guildCache = guildSongPreviousCache.get(message.guild!.id);
        if (guildCache === undefined) {
            embed.setColor(Colors.Blurple);
            embed.setDescription('There is no song to replay!');
            return message.reply({ embeds: [embed] });
        }

        if (player) {
            const botCurrentVoiceChannelId = message.guild?.members.me?.voice.channelId;
            if (botCurrentVoiceChannelId && message.member.voice.channelId && message.member.voice.channelId !== botCurrentVoiceChannelId) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
                return await message.reply({ embeds: [embed] });
            }
        } else {
            createPlayer(message);
            player = client.manager.players.get(message.guild!.id);
            player!.connect();
        }

        player = client.manager.players.get(message.guild!.id);

        const res = await player!.search(guildCache, message.author as any);

        logMessage(res.loadType, true);

        playSong(res, player!, embed, undefined, message, undefined);
    }
}