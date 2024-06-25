import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import prettyMilliseconds from "pretty-ms";
import { Track } from "magmastream";
import customPlaylistCache, { createCustomPlaylist } from "../../models/customPlaylist.js";
import playlistNames from "../../models/playlists.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/insert\nAvailable arguments: insert_position song_name_or_url_or_playlist isplaylist\`\`',
    data: new SlashCommandBuilder()
        .setName('insert')
        .setDescription('Inserts a song into the queue.')
        .addNumberOption(option => option.setName('insert_position').setDescription('The position to insert the song at.').setRequired(true))
        .addStringOption(option => option.setName('song_name_or_url_or_playlist').setDescription('The song name or url or playlist to insert.').setRequired(true))
        .addBooleanOption(option => option.setName('isplaylist').setDescription('Are you trying to play a custom playlist?').setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        let offset = interaction.options.getNumber('insert_position', true) - 1;

        const query = interaction.options.getString('song_name_or_url_or_playlist')!;

        if (offset < 0 || offset > player!.queue.length) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a valid song position!");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply().then(async () => {
            let res: any;

            if (query.toLowerCase() == 'liked') {
                const playlistName = 'liked_songs';
                const playlistNamesModel = await playlistNames.findOne({ userId: interaction.user.id });
                if (!playlistNamesModel) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no playlists!`);
                    return await interaction.editReply({ embeds: [embed] });
                }
                if (!playlistNamesModel.playlists.includes(playlistName)) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no liked songs!`);
                    return await interaction.editReply({ embeds: [embed] });
                } else {
                    let customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: interaction.user.id });
                    if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: interaction.user.id });
                    if (!customPlaylistModel) {
                        embed.setColor(Colors.Red);
                        embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                        return await interaction.editReply({ embeds: [embed] });
                    }
                    let resPlaylist = {
                        loadType: 'customPlaylist',
                        playlist: {
                            name: `${interaction.user.username}'s ${playlistName}`,
                            tracks: [] as Track[],
                            duration: 0
                        }
                    };
                    resPlaylist.playlist.tracks.push(...customPlaylistModel.songs as Track[]);
                    res = resPlaylist;
                }

            } else if (interaction.options.getBoolean('isplaylist')) {
                const playlistName = interaction.options.getString('song_name_or_url_or_playlist')!.replace(/[\p{Emoji}`]/gu, '').replace(/ /g, '_');
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
                    let customPlaylistModel = await customPlaylistCache.find(model => model.modelName === playlistName.toLowerCase())?.findOne({ userId: interaction.user.id });
                    if (!customPlaylistModel) customPlaylistModel = await createCustomPlaylist(playlistName).findOne({ userId: interaction.user.id });
                    if (!customPlaylistModel) {
                        embed.setColor(Colors.Red);
                        embed.setDescription(`You have no playlist named \`${playlistName}\`!`);
                        return await interaction.editReply({ embeds: [embed] });
                    }
                    let resPlaylist = {
                        loadType: 'customPlaylist',
                        playlist: {
                            name: `${interaction.user.username}'s ${playlistName}`,
                            tracks: [] as Track[],
                            duration: 0
                        }
                    };
                    resPlaylist.playlist.tracks.push(...customPlaylistModel.songs as Track[]);
                    res = resPlaylist;
                }
            } else {
                res = await player!.search(query, interaction.user as any);
            }

            switch (res.loadType) {
                case "empty":
                    embed.setColor(Colors.Red);
                    embed.setDescription(`Nothing found when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "error":
                    embed.setColor(Colors.Red);
                    embed.setDescription(`Load failed when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "track":
                    player!.queue.add(res.tracks[0], offset);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                    interaction.editReply({ embeds: [embed] });
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
                    player!.queue.add(res.tracks[0], offset);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                    interaction.editReply({ embeds: [embed] });
                    break;
            }
        });
    }
}