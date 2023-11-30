import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import { createPlayer, player } from "../../structures/player.js";
import client from "../../clientLogin.js";
import logMessage from "../../utils/logMessage.js";
import Keys from "../../keys.js";
import millisecondsToTime from "../../utils/msToTime.js";

export const command: CommandMessage = {
    slash: false,
    name: 'play',
    aliases: ['p'],
    usage: '\`\`!play\nAvailable Arguments: song_name/song_url\`\`',
    description: 'Plays a song.',
    async execute(message: Message, args: any) {
        const query = message.content.split(' ').slice(1).join(' ');
        logMessage(query, true);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!message.member?.voice.channel) {
            embed.setColor(Colors.Red);
            embed.setDescription("You must be in a voice channel to use this command!");
            return message.reply({ embeds: [embed] });
        }

        if (!query) {
            embed.setColor(Colors.Blurple);
            embed.setDescription("You need to provide a song name or url!");
            return message.reply({ embeds: [embed] });
        }


        const botCurrentVoiceChannelId = message.guild?.members.me?.voice.channelId;

        if (botCurrentVoiceChannelId && message.member.voice.channelId && message.member.voice.channelId !== botCurrentVoiceChannelId) {
            embed.setColor(Colors.Red);
            embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
            return await message.reply({ embeds: [embed] });
        }

        if (!(client.manager.players.get(message.guild!.id))) createPlayer(message);

        const res = await player.search(query, message.author);

        logMessage(res.loadType, true);

        switch (res.loadType) {
            case "empty":
                if (!player.queue.current) player.destroy();

                embed.setColor(Colors.Red);
                embed.setDescription(`Nothing found when searching for \`${query}\``);
                await message.reply({ embeds: [embed] });
                break;

            case "error":
                if (!player.queue.current) player.destroy();

                embed.setColor(Colors.Red);
                embed.setDescription(`Load failed when searching for \`${query}\``);
                await message.reply({ embeds: [embed] });
                break;

            case "track":
                player.queue.add(res.tracks[0]);

                if (player.state !== 'CONNECTED') await player.connect();

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue - \`${millisecondsToTime(res.tracks[0].duration)}\``);
                message.reply({ embeds: [embed] });

                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }
                break;

            case "playlist":
                if (!res.playlist?.tracks) return;

                if (player.state !== 'CONNECTED') await player.connect();

                player.queue.add(res.playlist.tracks);

                embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                message.reply({ embeds: [embed] });

                if (!player.playing && !player.paused && player.queue.size === res.playlist.tracks.length) {
                    await player.play();
                }
                break;

            case "search":
                if (player.state !== 'CONNECTED') await player.connect();

                player.queue.add(res.tracks[0]);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue - \`${millisecondsToTime(res.tracks[0].duration)}\``);
                message.reply({ embeds: [embed] });

                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }
                break;
        }

    }
}
