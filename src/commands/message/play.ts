import { Player } from "magmastream";
import client from "../../clientLogin.js"
import { Message } from "discord.js";

const createPlayer = (message: Message) => {
    player = client.manager.create({
        guild: message.guild!.id,
        voiceChannel: message.member!.voice.channel!.id,
        textChannel: message.channel.id,
        selfDeafen: true,
        volume: 20,
    });
}

let player: Player;

export const command = {
    slash: false,
    name: 'play',
    usage: '\`\`!play\nAvailable Arguments: song_name/song_url\`\`',
    description: 'Plays a song.',
    async execute(message: any, args: any) {
        const query = args[0];

        if (!query) return message.reply({ content: 'please provide a song name or url!', ephemeral: true });
        if (!message.member.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!', ephemeral: true });

        const botCurrentVoiceChannelId =
            message.guild?.members.me?.voice.channelId;

        if (botCurrentVoiceChannelId && message.member.voice.channelId && message.member.voice.channelId !== botCurrentVoiceChannelId) {
            return await message.reply({ content: `You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`, ephemeral: true });
        }

        if (!(player)) createPlayer(message);

        

        if (player.state !== 'CONNECTED') await player.connect();

        const res = await player.search(query, message.author);

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

                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }

                return await message.reply({
                    content: `Added [${res.tracks[0].title}](${res.tracks[0].uri}) to the queue.`,
                });

            case "playlist":
                if (!res.playlist?.tracks) return;

                player.queue.add(res.playlist.tracks);

                if (
                    !player.playing &&
                    !player.paused &&
                    player.queue.size === res.playlist.tracks.length
                ) {
                    await player.play();
                }

                return await message.reply({
                    content: `Added [${res.playlist.name}](${query}) playlist to the queue.`,
                });

            case "search":
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }

                return await message.reply({
                    content: `Added [${res.tracks[0].title}](${res.tracks[0].uri}) to the queue.`,
                });
            }

        }
    }