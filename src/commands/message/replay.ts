import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import prettyMilliseconds from "pretty-ms";
import logMessage from "../../utils/logMessage.js";
import { guildSongPreviousCache } from "../../events/lavalink/trackStart.js";
import { createPlayer } from "../../structures/player.js";

export const command: CommandMessage = {
    slash: false,
    name: 'replay',
    usage: '\`\`!replay\nNo available arguments\`\`',
    description: 'Replays the last played song.',
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

        const botCurrentVoiceChannelId = message.guild?.members.me?.voice.channelId;

        if(player) {
            if (botCurrentVoiceChannelId && message.member.voice.channelId && message.member.voice.channelId !== botCurrentVoiceChannelId) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
                return await message.reply({ embeds: [embed] });
            }
        } else {
            createPlayer(message);
        }

        player = client.manager.players.get(message.guild!.id);

        const res = await player!.search(guildCache, message.author);

        logMessage(res.loadType, true);

        switch (res.loadType) {
            case "empty":
                embed.setColor(Colors.Red);
                embed.setDescription(`There has been an error with replaying the song!`);
                await message.reply({ embeds: [embed] });
                break;

            case "error":
                embed.setColor(Colors.Red);
                embed.setDescription(`There has been an error with replaying the song!`);
                await message.reply({ embeds: [embed] });
                break;

            case "track":
                player!.queue.add(res.tracks[0]);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && !player!.queue.length) {
                    await player!.play();
                }
                break;

            case "playlist":
                if (!res.playlist?.tracks) return;

                player!.queue.add(res.playlist.tracks);

                embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${guildCache}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                    await player!.play();
                }
                break;

            case "search":
                player!.queue.add(res.tracks[0]);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && !player!.queue.length) {
                    await player!.play();
                }
                break;
        }
    }
}