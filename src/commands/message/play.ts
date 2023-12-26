import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import { createPlayer, player } from "../../structures/player.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import modelLikedSongs from "../../models/likedSongs.js";
import { SearchQuery, Track } from "magmastream";
import playlistNames from "../../models/playlists.js";
import customPlaylistSongsCache, { createCustomPlaylist } from "../../models/customPlaylist.js";

export const command: CommandMessage = {
    slash: false,
    name: 'play',
    aliases: ['p'],
    usage: '\`\`!play\nAvailable Arguments: song_name/song_url\`\`',
    description: 'Plays a song or playlist.',
    async execute(message: Message, args: any) {
        const query = message.content.split(' ').slice(1).join(' ');
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

        let player = client.manager.players.get(message.guild!.id);

        let res: any;

        if (query.toLowerCase() == 'liked') {
            let likedSongs = await modelLikedSongs.findOne({ userId: message.author.id });
            if (!likedSongs) {
                embed.setColor(Colors.Blurple);
                embed.setDescription(`You have no liked songs!`);
                return await message.reply({ embeds: [embed] });
            }
            let likedSongsArray = likedSongs.songs;
            if (likedSongsArray.length === 0) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no liked songs!`);
                return await message.reply({ embeds: [embed] });
            }
            let resLiked = {
                loadType: 'liked',
                playlist: {
                    name: '',
                    tracks: [] as Track[],
                    duration: 0
                }
            };
            await Promise.all(likedSongsArray.map(async uri => {
                resLiked.playlist?.tracks.push((await player!.search(uri, message.author)).tracks[0] as Track);
            }));
            resLiked.playlist!.name = `${message.author.username}'s Liked Songs`;
            res = resLiked;
        } else if (args[0].toLowerCase() == 'playlist') {
            if (!args[1]) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must provide a playlist name!`);
                return await message.reply({ embeds: [embed] });
            }
            const playlistName = message.content.split(' ').slice(2).join(' ').replace(/[\p{Emoji}`]/gu, '').replace(/ /g, '_');
            const playlistNamesModel = await playlistNames.findOne({ userId: message.author.id });
            if (!playlistNamesModel) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no playlists!`);
                return await message.reply({ embeds: [embed] });
            }
            if (!playlistNamesModel.playlists.includes(playlistName)) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                return await message.reply({ embeds: [embed] });
            } else {
                let customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
                if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
                if (!customPlaylistModel) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                    return await message.reply({ embeds: [embed] });
                }
                let resPlaylist = {
                    loadType: 'customPlaylist',
                    playlist: {
                        name: '',
                        tracks: [] as Track[],
                        duration: 0
                    }
                };
                await Promise.all(customPlaylistModel.songs.map(async (song: string | SearchQuery) => {
                    resPlaylist.playlist?.tracks.push((await player!.search(song, message.author)).tracks[0] as Track);
                }));
                resPlaylist.playlist!.name = `${message.author.username}'s ${playlistName}`;
                res = resPlaylist;
            }
        } else {
            res = await player!.search(query, message.author);
        }

        switch (res.loadType) {
            case "empty":
                if (!player!.queue.current) player!.destroy();

                embed.setColor(Colors.Red);
                embed.setDescription(`Nothing found when searching for \`${query}\``);
                await message.reply({ embeds: [embed] });
                break;

            case "error":
                if (!player!.queue.current) player!.destroy();

                embed.setColor(Colors.Red);
                embed.setDescription(`Load failed when searching for \`${query}\`\nPlease try again.`);
                await message.reply({ embeds: [embed] });
                break;

            case "track":
                player!.queue.add(res.tracks[0]);

                if (player!.state !== 'CONNECTED') await player!.connect();

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && !player!.queue.length) {
                    await player!.play();
                }
                break;

            case "playlist":
                if (!res.playlist?.tracks) return;

                if (player!.state !== 'CONNECTED') await player!.connect();

                embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                player!.queue.add(res.playlist.tracks);

                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                    await player!.play();
                }
                break;

            case "liked":
                if (!res.playlist?.tracks) return;

                if (player!.state !== 'CONNECTED') await player!.connect();

                embed.setDescription(`Added \`${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}\` with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                player!.queue.add(res.playlist.tracks);

                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                    await player!.play();
                }
                break;
            case "customPlaylist":
                if (!res.playlist?.tracks) return;

                if (player!.state !== 'CONNECTED') await player!.connect();

                embed.setDescription(`Added \`${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}\` with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                player!.queue.add(res.playlist.tracks);

                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                    await player!.play();
                }
                break;

            case "search":
                if (player!.state !== 'CONNECTED') await player!.connect();

                player!.queue.add(res.tracks[0]);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
                message.reply({ embeds: [embed] });

                if (!player!.playing && !player!.paused && !player!.queue.length) {
                    await player!.play();
                }
                break;
        }

    }
}
