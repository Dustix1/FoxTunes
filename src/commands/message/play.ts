import { Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import { createPlayer, player } from "../../structures/player.js";
import client from "../../clientLogin.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandMessage = {
    slash: false,
    name: 'play',
    usage: '\`\`!play\nAvailable Arguments: song_name/song_url\`\`',
    description: 'Plays a song.',
    async execute(message: Message, args: any) {
        const query = args[0];

        if (!query) return message.reply({ content: 'please provide a song name or url!'});
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!'});

        const botCurrentVoiceChannelId = message.guild?.members.me?.voice.channelId;

        if (botCurrentVoiceChannelId && message.member.voice.channelId && message.member.voice.channelId !== botCurrentVoiceChannelId) {
            return await message.reply({ content: `You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`});
        }

        if (!(client.manager.players.get(message.guild!.id))) createPlayer(message);

        const res = await player.search(query, message.author);

        logMessage(res.loadType);

        switch (res.loadType) {
            case "empty":
                if (!player.queue.current) player.destroy();

                return await message.reply({
                    content: `Load failed when searching for \`${query}\``,
                });

            case "error":
                if (!player.queue.current) player.destroy();

                return await message.reply({
                    content: `No matches when searching for \`${query}\``,
                });

            case "track":
                player.queue.add(res.tracks[0]);

                if (player.state !== 'CONNECTED') await player.connect();

                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }

                return (await message.reply({content: `Added [${res.tracks[0].title}](${res.tracks[0].uri}) to the queue.`,})).suppressEmbeds();

            case "playlist":
                if (!res.playlist?.tracks) return;

                if (player.state !== 'CONNECTED') await player.connect();

                player.queue.add(res.playlist.tracks);

                if (
                    !player.playing &&
                    !player.paused &&
                    player.queue.size === res.playlist.tracks.length
                ) {
                    await player.play();
                }

                return (await message.reply({content: `Added [${res.playlist.name}](${query}) playlist to the queue.`,})).suppressEmbeds();

            case "search":
                if (player.state !== 'CONNECTED') await player.connect();
                
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }

                return (await message.reply({ content: `Added [${res.tracks[0].title}](${res.tracks[0].uri}) to the queue.`, })).suppressEmbeds();
            }

        }
    }
