import { Message, EmbedBuilder, Colors } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import playlistNames from "../../models/playlists.js";
import { createCustomPlaylist } from "../../models/customPlaylist.js";
import customPlaylistSongsCache from "../../models/customPlaylist.js";
import logMessage from "../../utils/logMessage.js";
import mongoose, { Collection, Document } from "mongoose";

export const command: CommandMessage = {
    slash: false,
    name: 'playlist',
    usage: '\`\`!playlist\nAvailable arguments: playlist_name/list/create/delete/delete-all add/remove/clear/playlist_name   song\`\`',
    description: 'Manage your playlists',
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!args[0]) {
            embed.setDescription(`Available arguments: \`playlist_name/list/create/delete/delete-all   add/remove/list/clear/playlist_name   song\``)
            embed.setColor(Colors.Blurple);
            return message.reply({ embeds: [embed] })
        }

        let playlistNamesModel: any;
        let customPlaylistModel: any | Collection<Document<any, any>>;
        const playlistName = message.content.split(' ').slice(2).join(' ').replace(/[\p{Emoji}`]/gu, '').replace(/ /g, '_');

        switch (args[0].toLowerCase()) {
            default:
                playlistNamesModel = await playlistNames.findOne({ userId: message.author.id })
                if (playlistNamesModel?.playlists.includes(args[0].toLowerCase())) {
                    if (!args[1]) {
                        customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                        if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                        if (!customPlaylistModel.songs || customPlaylistModel.songs.length === 0) {
                            embed.setDescription(`Your playlist is empty!`);
                            embed.setColor(Colors.Blurple);
                            return message.reply({ embeds: [embed] })
                        }
                        embed.setTitle(`${args[0]}:`);
                        embed.setDescription(`\n\`${customPlaylistModel.songs.join(', ')}\``);
                        return message.channel.send({ embeds: [embed] })
                        break;
                    }
                    const song = message.content.split(' ').slice(3).join(' ').replace(/[\p{Emoji}`]/gu, '');
                    switch (args[1].toLowerCase()) {
                        case 'add':
                            if (!args[2]) {
                                embed.setDescription(`You need to provide a song!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] })
                            }
                            customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                            if (customPlaylistModel.songs.includes(song)) {
                                embed.setDescription(`This song is already in the playlist!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] });
                            }
                            customPlaylistModel.songs.push(song);
                            embed.setDescription(`Added \`${song}\` to \`${args[0]}\``);
                            await customPlaylistModel?.save();
                            return message.reply({ embeds: [embed] });
                            break;
                        case 'remove':
                            if (!args[2]) {
                                embed.setDescription(`You need to provide a song!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] })
                            }
                            customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                            if (!customPlaylistModel.songs.includes(song)) {
                                embed.setDescription(`This song is not in the playlist!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] });
                            }
                            customPlaylistModel.songs.splice(customPlaylistModel.songs.indexOf(song), 1);
                            embed.setDescription(`Removed \`${song}\` from \`${args[0]}\``);
                            await customPlaylistModel?.save();
                            return message.reply({ embeds: [embed] });
                            break;
                        case 'list':
                            customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                            if (!customPlaylistModel.songs || customPlaylistModel.songs.length === 0) {
                                embed.setDescription(`Your playlist is empty!`);
                                embed.setColor(Colors.Blurple);
                                return message.reply({ embeds: [embed] })
                            }
                            embed.setTitle(`${args[0]}:`);
                            embed.setDescription(`\n\`${customPlaylistModel.songs.join(', ')}\``);
                            return message.channel.send({ embeds: [embed] })
                            break;
                        case 'clear':
                            customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                            if (!customPlaylistModel.songs || customPlaylistModel.songs.length === 0) {
                                embed.setDescription(`Your playlist is already empty!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] })
                            }
                            customPlaylistModel.songs = [];
                            embed.setDescription(`Cleared \`${args[0]}\``);
                            await customPlaylistModel?.save();
                            return message.reply({ embeds: [embed] });
                            break;
                    }
                } else {
                    embed.setDescription(`Available arguments: \`playlist_name/list/create/delete/delete-all   add/remove/clear/playlist_name   song\``)
                    embed.setColor(Colors.Blurple);
                    return message.reply({ embeds: [embed] })
                }
                break;
            case 'list':
                playlistNamesModel = await playlistNames.findOne({ userId: message.author.id })
                if (!playlistNamesModel || playlistNamesModel.playlists.length === 0) {
                    embed.setDescription('You don\'t have any playlists yet!');
                    embed.setColor(Colors.Blurple);
                    return message.reply({ embeds: [embed] })
                }
                embed.setTitle(`Your playlists:`)
                embed.setDescription(`\n\`${playlistNamesModel.playlists.join(', ')}\``)
                return message.channel.send({ embeds: [embed] })
                break;
            case 'create':
                if (!args[1]) {
                    embed.setDescription('You need to provide a playlist name!');
                    embed.setColor(Colors.Blurple);
                    return message.reply({ embeds: [embed] })
                } else if (args[1].toLowerCase() === 'likedsongs') {
                    embed.setDescription(`You can't create the \`likedsongs\` playlist!\nIt's automatically created when you like a song!`);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] })
                }
                playlistNamesModel = await playlistNames.findOne({ userId: message.author.id });

                if (!playlistNamesModel) {
                    playlistNamesModel = await playlistNames.create({ userId: message.author.id, playlists: [playlistName] });
                    let customPlaylist = customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase());
                    if (customPlaylist) {
                        customPlaylistModel = await customPlaylist.create({ userId: message.author.id, songs: [] });
                    } else {
                        customPlaylist = createCustomPlaylist(playlistName);
                        customPlaylistModel = await customPlaylist.create({ userId: message.author.id, songs: [] });
                    }
                    logMessage(`Created playlist ${playlistName} for ${message.author.tag}`);
                    embed.setDescription(`Created playlist \`${playlistName}\``);
                    message.reply({ embeds: [embed] })
                } else if (playlistNamesModel.playlists.includes(playlistName.toLowerCase())) {
                    embed.setDescription(`You already have a playlist named \`${playlistName}\``)
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] })
                } else {
                    playlistNamesModel.playlists.push(playlistName);
                    let customPlaylist = customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase());
                    if (customPlaylist) {
                        customPlaylistModel = await customPlaylist.create({ userId: message.author.id, songs: [] });
                    } else {
                        customPlaylist = createCustomPlaylist(playlistName);
                        customPlaylistModel = await customPlaylist.create({ userId: message.author.id, songs: [] });
                    }
                    embed.setDescription(`Created playlist \`${playlistName}\``);
                    logMessage(`Created playlist ${playlistName} for ${message.author.tag}`);
                    message.reply({ embeds: [embed] })
                }
                await playlistNamesModel?.save();
                await customPlaylistModel?.save();
                break;
            case 'delete':
                if (!args[1]) {
                    embed.setDescription('You need to provide a playlist name!');
                    embed.setColor(Colors.Blurple);
                    return message.reply({ embeds: [embed] });
                } else if (args[1].toLowerCase() === 'likedsongs') {
                    embed.setDescription(`You can't delete the \`likedsongs\` playlist!`);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] });
                }
                playlistNamesModel = await playlistNames.findOne({ userId: message.author.id })

                if (!playlistNamesModel) {
                    embed.setDescription(`You don't have a playlist named \`${playlistName}\``);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] });
                } else if (!playlistNamesModel.playlists.includes(playlistName)) {
                    embed.setDescription(`You don't have a playlist named \`${playlistName}\``);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] });
                } else {
                    customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
                    if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
                    const cpmColl: Collection = customPlaylistModel.collection;
                    if (await cpmColl.countDocuments() > 1) {
                        await cpmColl.deleteOne({ userId: message.author.id });
                    } else {
                        cpmColl.drop();
                    }
                    playlistNamesModel.playlists.splice(playlistNamesModel.playlists.indexOf(playlistName), 1);
                }
                embed.setDescription(`Deleted playlist \`${playlistName}\``);
                await playlistNamesModel?.save();
                return message.reply({ embeds: [embed] });
                break;
            case 'delete-all':
                playlistNamesModel = await playlistNames.findOne({ userId: message.author.id });
                if (!playlistNamesModel || playlistNamesModel.playlists.length === 0) {
                    embed.setDescription(`You don't have any playlists!`);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] });
                } else {
                    let likedSongsModel = await playlistNames.findOne({ userId: message.author.id });
                    if (likedSongsModel) {
                        playlistNamesModel.playlists.forEach(async (playlistName: string) => {
                            if (playlistName != 'likedsongs') {
                                customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
                                if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
                                const cpmColl: Collection = customPlaylistModel.collection;
                                if (await cpmColl.countDocuments() > 1) {
                                    await cpmColl.deleteOne({ userId: message.author.id });
                                } else {
                                    cpmColl.drop();
                                }
                            }
                        });
                        playlistNamesModel.playlists = ['likedsongs'];
                        embed.setDescription(`Deleted all your playlists except liked songs!\n Please note that you can't delete the \`likedsongs\` playlist`);
                    } else {
                        playlistNamesModel.playlists.forEach(async (playlistName: string) => {
                            customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
                            const cpmColl: Collection = customPlaylistModel.collection;
                            if (await cpmColl.countDocuments() > 1) {
                                await cpmColl.deleteOne({ userId: message.author.id });
                            } else {
                                cpmColl.drop();
                            }
                        });
                        playlistNamesModel.playlists = [];
                        embed.setDescription(`Deleted all your playlists!`);
                    }
                }
                await playlistNamesModel?.save();
                return message.reply({ embeds: [embed] });
                break;
        }
    }
}