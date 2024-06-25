import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import { Track } from "magmastream";
import customPlaylistCache, { createCustomPlaylist } from "../../models/customPlaylist.js";
import playlistNames from "../../models/playlists.js";
import playSong from "../../utils/playSong.js";

export const command: CommandMessage = {
    slash: false,
    name: 'insert',
    aliases: ['add', 'insert-song', 'add-song'],
    usage: '\`\`!insert\nAvailable arguments: insert_position song_name_or_url\`\`',
    description: 'Inserts a song into the queue.',
    group: 'queueMgmt',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
        if (!canUserUseCommand(player, message, embed)) return;

        const query = message.content.split(' ').slice(2).join(' ');

        if (!args[0]) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a song position!");
            return message.reply({ embeds: [embed] });
        }

        if (isNaN(args[0])) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a valid song position!");
            return message.reply({ embeds: [embed] });
        }

        if (!query) {
            embed.setColor(Colors.Blurple);
            embed.setDescription("You need to provide a song name or url!");
            return message.reply({ embeds: [embed] });
        }

        let offset = Number(args[0]) - 1;

        if (offset < 0 || offset > player!.queue.length) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a valid song position!");
            return message.reply({ embeds: [embed] });
        }

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
                    loadType: 'customPlaylist',
                    playlist: {
                        name: `${message.author.username}'s ${playlistName}`,
                        tracks: [] as Track[],
                        duration: 0
                    }
                };
                resPlaylist.playlist.tracks.push(...customPlaylistModel.songs as Track[]);
                res = resPlaylist;
            }

        } else if (args[1].toLowerCase() == 'playlist') {
            if (!args[2]) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must provide a playlist name!`);
                return await message.reply({ embeds: [embed] });
            }
            const playlistName = message.content.split(' ').slice(3).join(' ').replace(/[\p{Emoji}`]/gu, '').replace(/ /g, '_');
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
                res = resPlaylist;
            }
        } else {
            res = await player!.search(query, message.author as any);
        }

        playSong(res, player!, embed, query, message, undefined);
    }
}