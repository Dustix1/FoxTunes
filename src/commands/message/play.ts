import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import { createPlayer, player } from "../../structures/player.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { Track } from "magmastream";
import playlistNames from "../../models/playlists.js";
import customPlaylistCache, { createCustomPlaylist } from "../../models/customPlaylist.js";
import playSong from "../../utils/playSong.js";

export const command: CommandMessage = {
    slash: false,
    name: 'play',
    aliases: ['p'],
    usage: '\`\`!play\nAvailable Arguments: song_name/song_url/liked/playlist <custom playlist name>\`\`',
    description: 'Plays a song or playlist.',
    group: 'musicPlayback',
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
            const playlistName = 'liked_songs';
            const playlistNamesModel = await playlistNames.findOne({ userId: message.author.id });
            if (!playlistNamesModel) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no playlists!`);
                return await message.reply({ embeds: [embed] });
            }
            if (!playlistNamesModel.playlists.includes(playlistName)) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no liked songs!`);
                return await message.reply({ embeds: [embed] });
            } else {
                let customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
                if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
                if (!customPlaylistModel) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                    return await message.reply({ embeds: [embed] });
                }
                let resPlaylist = {
                    loadType: 'likedPlaylist',
                    playlist: {
                        name: `${message.author.username}'s ${playlistName}`,
                        tracks: [] as Track[],
                        duration: 0
                    }
                };
                resPlaylist.playlist.tracks.push(...customPlaylistModel.songs as Track[]);

                if (!resPlaylist.playlist?.tracks) return;

                if (player!.state !== 'CONNECTED') await player!.connect();

                player!.queue.add(resPlaylist.playlist.tracks);

                if (!player!.playing && !player!.paused && player!.queue.size === resPlaylist.playlist.tracks.length) {
                    await player!.play();
                }

                embed.setDescription(`Added \`${playlistName}\` to the queue.`);
                message.reply({ embeds: [embed] });

                return;
            }

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
                let customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
                if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
                if (!customPlaylistModel) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                    return await message.reply({ embeds: [embed] });
                }
                let resPlaylist = {
                    loadType: 'customPlaylist',
                    playlist: {
                        name: `${message.author.username}'s ${playlistName}`,
                        tracks: [] as Track[],
                        duration: 0
                    }
                };
                resPlaylist.playlist.tracks.push(...customPlaylistModel.songs as Track[]);

                if (!resPlaylist.playlist?.tracks) return;

                if (player!.state !== 'CONNECTED') await player!.connect();

                player!.queue.add(resPlaylist.playlist.tracks);

                if (!player!.playing && !player!.paused && player!.queue.size === resPlaylist.playlist.tracks.length) {
                    await player!.play();
                }

                embed.setDescription(`Added ${message.author.displayName}'s \`${playlistName}\` to the queue.`);
                message.reply({ embeds: [embed] });

                return;
            }
        } else {
            res = await player!.search(query, message.author as any);
        }

        playSong(res, player!, embed, query, message, undefined);
    }
}
