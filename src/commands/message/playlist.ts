import { Message, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, APIEmbedField } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import playlistNames from "../../models/playlists.js";
import { createCustomPlaylist } from "../../models/customPlaylist.js";
import customPlaylistCache from "../../models/customPlaylist.js";
import logMessage from "../../utils/logMessage.js";
import { Collection, Document, model } from "mongoose";
import client from "../../clientLogin.js";
import { createPlayer } from "../../structures/player.js";
import { Player, Track } from "magmastream";

export const command: CommandMessage = {
    slash: false,
    name: 'playlist',
    aliases: ['pl', 'playlists', 'customplaylist', 'custom-playlist'],
    usage: '\`Please refer to !help playlist since this is a complex command\`',
    description: 'Manage your custom playlists',
    group: 'general',
    async execute(message: Message, args: any) {
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor);
        let player = client.manager.players.get('0000000000000000000');
        if (!player) {
            createPlayer(0);
            player = client.manager.players.get('0000000000000000000')!;
        }

        if (!args[0]) {
            embed.setDescription(this.usage)
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
                        customPlaylistModel = await customPlaylistCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                        if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                        if (!customPlaylistModel.songs || customPlaylistModel.songs.length === 0) {
                            embed.setDescription(`Your playlist is empty!`);
                            embed.setColor(Colors.Blurple);
                            return message.reply({ embeds: [embed] })
                        }
                        listPlaylist(customPlaylistModel, args, message);
                        break;
                    }
                    let song: string = message.content.split(' ').slice(3).join(' ');
                    const playlistName = args[0];
                    switch (args[1].toLowerCase()) {
                        default:
                            embed.setDescription(this.usage)
                            embed.setColor(Colors.Blurple);
                            return message.reply({ embeds: [embed] })
                            break;
                        case 'add':
                            if (!args[2]) {
                                embed.setDescription(`You need to provide a song!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] })
                            }
                            logMessage(`Adding ${song} to ${playlistName} for ${message.author.tag}`)
                            searchQuery(song, message, embed, customPlaylistModel, playlistName, player);
                            break;
                        case 'remove':
                            if (!args[2]) {
                                embed.setDescription(`You need to provide a song!`);
                                embed.setColor(Colors.Red);
                                return message.reply({ embeds: [embed] })
                            }
                            customPlaylistModel = await customPlaylistCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                            let track: Track | string | undefined;
                            if (isNaN(parseInt(song))) {
                                customPlaylistModel.songs.forEach((modelTrack: Track) => {
                                    if (modelTrack.title.toLowerCase() == song.toLowerCase()) {
                                        track = modelTrack;
                                    }
                                });
                                if (!track) {
                                    embed.setDescription(`This song is not in the playlist!`);
                                    embed.setColor(Colors.Red);
                                    return message.reply({ embeds: [embed] });
                                }
                                track = customPlaylistModel.songs.splice(customPlaylistModel.songs.indexOf(track), 1)[0];
                            } else {
                                try {
                                    track = customPlaylistModel.songs.splice(parseInt(song) - 1, 1)[0];
                                } catch {
                                    embed.setDescription(`This is not a valid song number!`);
                                    embed.setColor(Colors.Red);
                                    return message.reply({ embeds: [embed] });
                                }
                                if (!track) {
                                    embed.setDescription(`This song is not in the playlist!`);
                                    embed.setColor(Colors.Red);
                                    return message.reply({ embeds: [embed] });
                                }
                            }
                            embed.setDescription(`Removed \`${(track! as Track).title}\` from \`${args[0]}\``);
                            await customPlaylistModel?.save();
                            return message.reply({ embeds: [embed] });
                            break;
                        case 'list':
                            customPlaylistModel = await customPlaylistCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
                            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(args[0]).findOne({ userId: message.author.id });
                            if (!customPlaylistModel.songs || customPlaylistModel.songs.length === 0) {
                                embed.setDescription(`Your playlist is empty!`);
                                embed.setColor(Colors.Blurple);
                                return message.reply({ embeds: [embed] })
                            }
                            listPlaylist(customPlaylistModel, args, message);
                            break;

                        case 'clear':
                            customPlaylistModel = await customPlaylistCache.find(model => model.modelName === args[0].toLowerCase())?.findOne({ userId: message.author.id });
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
                    embed.setDescription(this.usage)
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
                embed.setDescription(`\n\`${playlistNamesModel.playlists.join('\`, \`')}\``)
                return message.channel.send({ embeds: [embed] })
                break;
            case 'create':
                if (!args[1]) {
                    embed.setDescription('You need to provide a playlist name!');
                    embed.setColor(Colors.Blurple);
                    return message.reply({ embeds: [embed] })
                }
                playlistNamesModel = await playlistNames.findOne({ userId: message.author.id });

                if (!playlistNamesModel) {
                    playlistNamesModel = await playlistNames.create({ userId: message.author.id, playlists: [playlistName] });
                    let customPlaylist = customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase());
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
                    let customPlaylist = customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase());
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
                    customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
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
                if (!playlistNamesModel || playlistNamesModel.playlists.length === 0 || (playlistNamesModel.playlists.length === 1 && playlistNamesModel.playlists[0] === 'likedsongs')) {
                    embed.setDescription(`You don't have any custom playlists!`);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] });
                } else {
                    playlistNamesModel.playlists.forEach(async (playlistName: string) => {
                        customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
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
                await playlistNamesModel?.save();
                return message.reply({ embeds: [embed] });
                break;
        }
    }
}




async function searchQuery(query: string, message: Message, embed: EmbedBuilder, customPlaylistModel: any, playlistName: string, player: Player) {
    let res = await player!.search(query);

    let newTrack;

    switch (res.loadType) {
        case "empty":
            embed.setColor(Colors.Red);
            embed.setDescription(`Nothing found when searching for \`${query}\``);
            await message.reply({ embeds: [embed] });
            break;

        case "error":
            embed.setColor(Colors.Red);
            embed.setDescription(`Load failed when searching for \`${query}\`\nPlease try again.`);
            await message.reply({ embeds: [embed] });
            break;

        case "track":
            customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
            if (customPlaylistModel.songs.includes(res.tracks[0])) {
                embed.setDescription(`This song is already in the playlist!`);
                embed.setColor(Colors.Red);
                return message.reply({ embeds: [embed] });
            }

            newTrack = {
                uri: res.tracks[0].uri,
                artworkUrl: res.tracks[0].artworkUrl,
                sourceName: res.tracks[0].sourceName,
                title: res.tracks[0].title,
                identifier: res.tracks[0].identifier,
                author: res.tracks[0].author,
                duration: res.tracks[0].duration,
                isSeekable: res.tracks[0].isSeekable,
                isStream: res.tracks[0].isStream,
                thumbnail: res.tracks[0].thumbnail,
                requester: res.tracks[0].requester,
                track: res.tracks[0].track,
            };

            customPlaylistModel.songs.push(newTrack);
            embed.setDescription(`Added \`${res.tracks[0].title}\` to \`${playlistName}\``);
            await customPlaylistModel?.save();
            return message.reply({ embeds: [embed] });
            break;

        case "playlist":
            if (!res.playlist?.tracks) {
                return;
            }
            customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });

            let alreadyInPlaylist: string[] = [];
            let isAlreadyInPlaylist = false;
            res.playlist.tracks.forEach(async (track: any) => {
                isAlreadyInPlaylist = false;
                customPlaylistModel.songs.forEach((modelTrack: { uri: string; }) => {
                    if (modelTrack.uri == track.uri) {
                        alreadyInPlaylist.push(track.title);
                        isAlreadyInPlaylist = true;
                    }
                });
                if (!isAlreadyInPlaylist) {
                    newTrack = {
                        uri: track.uri,
                        artworkUrl: track.artworkUrl,
                        sourceName: track.sourceName,
                        title: track.title,
                        identifier: track.identifier,
                        author: track.author,
                        duration: track.duration,
                        isSeekable: track.isSeekable,
                        isStream: track.isStream,
                        thumbnail: track.thumbnail,
                        requester: track.requester,
                        track: track.track,
                    };
                    customPlaylistModel.songs.push(newTrack);
                }
            });
            embed.setDescription(`Added all songs from \`${res.playlist.name}\` to \`${playlistName}\``);
            await customPlaylistModel?.save();
            message.reply({ embeds: [embed] });
            if (alreadyInPlaylist.length > 0) {
                embed.setDescription(`The following songs were already in the playlist: ${alreadyInPlaylist.join('\`, \`')}`);
                message.reply({ embeds: [embed] });
            }
            break;

        case "search":
            customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: message.author.id });
            if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: message.author.id });
            customPlaylistModel.songs.forEach((song: { uri: string; }) => {
                if (song.uri == res.tracks[0].uri) {
                    embed.setDescription(`This song is already in the playlist!`);
                    embed.setColor(Colors.Red);
                    return message.reply({ embeds: [embed] });
                }
            });

            newTrack = {
                uri: res.tracks[0].uri,
                artworkUrl: res.tracks[0].artworkUrl,
                sourceName: res.tracks[0].sourceName,
                title: res.tracks[0].title,
                identifier: res.tracks[0].identifier,
                author: res.tracks[0].author,
                duration: res.tracks[0].duration,
                isSeekable: res.tracks[0].isSeekable,
                isStream: res.tracks[0].isStream,
                thumbnail: res.tracks[0].thumbnail,
                requester: res.tracks[0].requester,
                track: res.tracks[0].track,
            };

            customPlaylistModel.songs.push(newTrack);
            embed.setDescription(`Added \`${res.tracks[0].title}\` to \`${playlistName}\``);
            await customPlaylistModel?.save();
            return message.reply({ embeds: [embed] });
            break;
    }
}

const songsPerPage = 10;
let page: number;

function listPlaylist(customPlaylistModel: any, args: any, message: Message) {
    let embed = new EmbedBuilder()
        .setColor(Keys.mainColor)

    let previousButton = new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('<')
        .setStyle(ButtonStyle.Secondary);

    let nextButton = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('>')
        .setStyle(ButtonStyle.Secondary);

    let lastButton = new ButtonBuilder()
        .setCustomId('last')
        .setLabel('>>')
        .setStyle(ButtonStyle.Secondary);

    let firstButton = new ButtonBuilder()
        .setCustomId('first')
        .setLabel('<<')
        .setStyle(ButtonStyle.Secondary);

    let queueEmbed = new EmbedBuilder()
        .setColor(Keys.mainColor)
        .setTitle(`${args[0]} Playlist`)

    page = 1;
    addEmbendFields(customPlaylistModel, queueEmbed, page, previousButton, nextButton, firstButton, lastButton);
    let myMessage;
    if (Math.ceil(customPlaylistModel.songs.length == 0 ? 1 : customPlaylistModel.songs.length / songsPerPage) == 1) {
        myMessage = message.channel.send({ embeds: [queueEmbed] });
    } else {
        myMessage = message.channel.send({ embeds: [queueEmbed], components: [{ type: 1, components: [firstButton, previousButton, nextButton, lastButton] }] });
        waitForButton(myMessage, message, customPlaylistModel, queueEmbed, previousButton, nextButton, firstButton, lastButton);
    }
}

async function addEmbendFields(customPlaylistModel: any, embed: EmbedBuilder, page: any, previousButton: ButtonBuilder, nextButton: ButtonBuilder, firstButton: ButtonBuilder, lastButton: ButtonBuilder) {
    if (page == 1) {
        previousButton.setDisabled(true);
        firstButton.setDisabled(true);
    } else {
        previousButton.setDisabled(false);
        firstButton.setDisabled(false);
    }

    if (page == Math.ceil(customPlaylistModel.songs.length == 0 ? 1 : customPlaylistModel.songs.length / songsPerPage)) {
        nextButton.setDisabled(true)
        lastButton.setDisabled(true);
    } else {
        nextButton.setDisabled(false);
        lastButton.setDisabled(false);
    }

    embed.setFields([]);
    let fields: APIEmbedField[] = [];

    let songs = ``;
    if (customPlaylistModel.songs.length != 0) songs += `**<:queue:1180256450560405555> Songs in playlist [${customPlaylistModel.songs.length}]**\n`;
    customPlaylistModel.songs.slice(page == 1 ? 0 : (page * songsPerPage) - songsPerPage, page == 1 ? songsPerPage : ((page * songsPerPage) - songsPerPage) + songsPerPage).forEach((song: { uri: string; title: string }, index: number) => {
        songs += `**${page == 1 ? (index + 1) : (((page * songsPerPage) - songsPerPage) + index) + 1}.** -  [${song.title.replace(/[\p{Emoji}]/gu, '')}](${song.uri})\n`;
    });
    embed.setDescription(songs);
    //fields.push({ name: 'Playlist duration', value: `\`${prettyMilliseconds(player!.queue.duration, { verbose: true, secondsDecimalDigits: 0 })}\``, inline: false });

    embed.setFooter({ text: `Page ${page} of ${Math.ceil(customPlaylistModel.songs.length == 0 ? 1 : customPlaylistModel.songs.length / songsPerPage)}` });
    embed.addFields(fields!);
}


async function waitForButton(myMessage: any, message: any, customPlaylistModel: any, queueEmbed: EmbedBuilder, previousButton: ButtonBuilder, nextButton: ButtonBuilder, firstButton: ButtonBuilder, lastButton: ButtonBuilder) {
    try {
        let buttonInt = (await myMessage).awaitMessageComponent({ time: 90000 });
        switch ((await buttonInt).customId) {
            case 'next':
                page++;
                break;
            case 'previous':
                page--;
                break;
            case 'first':
                page = 1;
                break;
            case 'last':
                page = Math.ceil(customPlaylistModel.songs.length == 0 ? 1 : customPlaylistModel.songs.length / songsPerPage);
                break;
        }
        await addEmbendFields(customPlaylistModel, queueEmbed, page, previousButton, nextButton, firstButton, lastButton).then(async () => {
            (await buttonInt).update({ embeds: [queueEmbed], components: [{ type: 1, components: [firstButton, previousButton, nextButton, lastButton] }] });
            waitForButton(myMessage, message, customPlaylistModel, queueEmbed, previousButton, nextButton, firstButton, lastButton);
        });
    } catch (err) {
        firstButton.setDisabled(true);
        nextButton.setDisabled(true);
        previousButton.setDisabled(true);
        lastButton.setDisabled(true);
        queueEmbed.setFooter({ text: 'This message is inactive.' });
        (await myMessage).edit({ embeds: [queueEmbed], components: [{ type: 1, components: [firstButton, previousButton, nextButton, lastButton] }] });
    }
}