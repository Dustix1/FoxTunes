import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, Colors, EmbedBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import { createPlayer, player } from "../../structures/player.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import modelLikedSongs from "../../models/likedSongs.js";
import { SearchQuery, Track } from "magmastream";
import customPlaylistSongsCache, { createCustomPlaylist } from "../../models/customPlaylist.js";
import playlistNames from "../../models/playlists.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/play\nAvailable Arguments: song_name/song_url\`\`',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption((option) => option.setName('song').setDescription('The song to play.').setRequired(true))
        .addBooleanOption((option) => option.setName('customplaylist').setDescription('Are you trying to play a custom playlist?').setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString('song')!;
        let member = interaction.member as GuildMember;
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!member.voice.channel) {
            embed.setColor(Colors.Red);
            embed.setDescription("You must be in a voice channel to use this command!");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const botCurrentVoiceChannelId = interaction.guild?.members.me?.voice.channelId;

        if (botCurrentVoiceChannelId && member.voice.channelId && member.voice.channelId !== botCurrentVoiceChannelId) {
            embed.setColor(Colors.Red);
            embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply().then(async () => {
            if (!(client.manager.players.get(interaction.guild!.id))) createPlayer(interaction);

            let player = client.manager.players.get(interaction.guild!.id);

            let res: any;
            if (query.toLowerCase() === 'liked') {
                let likedSongs = await modelLikedSongs.findOne({ userId: interaction.user.id });
                if (!likedSongs) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no liked songs!`);
                    return await interaction.editReply({ embeds: [embed] });
                }
                let likedSongsArray = likedSongs.songs;
                if (likedSongsArray.length === 0) {
                    embed.setColor(Colors.Blurple);
                    embed.setDescription(`You have no liked songs!`);
                    return await interaction.editReply({ embeds: [embed] });
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
                    resLiked.playlist?.tracks.push((await player!.search(uri, interaction.user)).tracks[0] as Track);
                }));
                resLiked.playlist!.name = `${interaction.user.username}'s Liked Songs`;
                res = resLiked;
            } else if (interaction.options.getBoolean('customplaylist')) {
                const playlistName = interaction.options.getString('song')!;
                const playlistNamesModel = await playlistNames.findOne({ userId: interaction.user.id });
                if (!playlistNamesModel) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no playlists!`);
                    return await interaction.editReply({ embeds: [embed] });
                }
                if (!playlistNamesModel.playlists.includes(playlistName)) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                    return await interaction.editReply({ embeds: [embed] });
                } else {
                    let customPlaylistModel = await customPlaylistSongsCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: interaction.user.id });
                    if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: interaction.user.id });
                    if (!customPlaylistModel) {
                        embed.setColor(Colors.Red);
                        embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                        return await interaction.editReply({ embeds: [embed] });
                    }
                    let customPlaylistSongs = customPlaylistModel.songs;
                    if (customPlaylistSongs.length === 0) {
                        embed.setColor(Colors.Red);
                        embed.setDescription(`Your playlist named \`${playlistName}\` has no songs!`);
                        return await interaction.editReply({ embeds: [embed] });
                    }
                    let resPlaylist = {
                        loadType: 'customPlaylist',
                        playlist: {
                            name: '',
                            tracks: [] as Track[],
                            duration: 0
                        }
                    };
                    await Promise.all(customPlaylistSongs.map(async (song: string | SearchQuery) => {
                        resPlaylist.playlist?.tracks.push((await player!.search(song, interaction.user)).tracks[0] as Track);
                    }));
                    resPlaylist.playlist!.name = `${interaction.user.username}'s ${playlistName}`;
                    res = resPlaylist;
                    logMessage(res.playlist.tracks.length)
                }
            } else {
                res = await player!.search(query, interaction.user);
            }

            switch (res.loadType) {
                case "empty":
                    if (!player!.queue.current) player!.destroy();

                    embed.setColor(Colors.Red);
                    embed.setDescription(`Nothing found when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "error":
                    if (!player!.queue.current) player!.destroy();

                    embed.setColor(Colors.Red);
                    embed.setDescription(`Load failed when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "track":
                    player!.queue.add(res.tracks[0]);

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && !player!.queue.length) {
                        await player!.play();
                    }
                    break;

                case "playlist":
                    if (!res.playlist?.tracks) return;

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    player!.queue.add(res.playlist.tracks);

                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;

                case "liked":
                    if (!res.playlist?.tracks) return;

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added \`${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}\` with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    player!.queue.add(res.playlist.tracks);

                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;
                case "customPlaylist":
                    if (!res.playlist?.tracks) return;

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added \`${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}\` with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    player!.queue.add(res.playlist.tracks);

                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;

                case "search":
                    if (player!.state !== 'CONNECTED') await player!.connect();

                    player!.queue.add(res.tracks[0]);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && !player!.queue.length) {
                        await player!.play();
                    }
                    break;
            }
        });
    }
}