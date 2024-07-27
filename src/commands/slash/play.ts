import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, Colors, EmbedBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import { createPlayer } from "../../structures/player.js";
import Keys from "../../keys.js";
import { Track } from "magmastream";
import customPlaylistCache, { createCustomPlaylist } from "../../models/customPlaylist.js";
import playlistNames from "../../models/playlists.js";
import playSong from "../../utils/playSong.js";

export const command: CommandSlash = {
    slash: true,
    group: 'musicPlayback',
    usage: '`\`!play\nAvailable Arguments: song_name/song_url/liked/playlist <custom playlist name>\`\`',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption((option) => option.setName('song').setDescription('The song or playlist to play.').setRequired(true))
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
                    loadType: 'likedPlaylist',
                    playlist: {
                        name: `${interaction.user.username}'s ${playlistName}`,
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
                await interaction.editReply({ embeds: [embed] });

                return;
            }

        } else if (interaction.options.getBoolean('customplaylist')) {
            const playlistName = interaction.options.getString('song')!.replace(/[\p{Emoji}`]/gu, '').replace(/ /g, '_');
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

                if (!resPlaylist.playlist?.tracks) return;

                if (player!.state !== 'CONNECTED') await player!.connect();

                player!.queue.add(resPlaylist.playlist.tracks);

                if (!player!.playing && !player!.paused && player!.queue.size === resPlaylist.playlist.tracks.length) {
                    await player!.play();
                }

                embed.setDescription(`Added \`${playlistName}\` to the queue.`);
                await interaction.editReply({ embeds: [embed] });

                return;
            }
        } else {
            res = await player!.search(query, interaction.user as any);
        }

            playSong(res, player!, embed, query, undefined, interaction);
        });
    }
}