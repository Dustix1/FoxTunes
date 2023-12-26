import { Player, Track } from "magmastream";
import client from "../../clientLogin.js";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, InteractionCollector, Message, TextChannel } from "discord.js";
import logMessage from "../../utils/logMessage.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import { player } from "../../structures/player.js";
import modelLikedSongs from "../../models/likedSongs.js";
import playlistNames from "../../models/playlists.js";

export const guildSongPreviousCache = new Map<string, string>();
export const guildSongNewCache = new Map<string, string>();
export const guildNowPlayingMessageCache = new Map<string, Message>();
export const guildCollectorCache = new Map<string, InteractionCollector<ButtonInteraction<CacheType>> | InteractionCollector<ButtonInteraction<"cached">>>();

let nowPlayingMessage: Message | undefined;
export let embed: EmbedBuilder;
export const pauseButton = new ButtonBuilder()
    .setCustomId('pause')
    .setEmoji('<:pause:1184910921823436800>')
    .setStyle(ButtonStyle.Secondary);

export const resumeButton = new ButtonBuilder()
    .setCustomId('resume')
    .setEmoji('<:play:1184911090681921596>')
    .setStyle(ButtonStyle.Success);

export const skipButton = new ButtonBuilder()
    .setCustomId('skip')
    .setEmoji('<:skipforward:1184913006325420032>')
    .setStyle(ButtonStyle.Secondary);

export const stopButton = new ButtonBuilder()
    .setCustomId('stop')
    .setEmoji('<:stop:1184914230445613117>')
    .setStyle(ButtonStyle.Secondary);

export const shuffleButton = new ButtonBuilder()
    .setCustomId('shuffle')
    .setEmoji('<:shuffle1:1184916558712160351>')
    .setStyle(ButtonStyle.Secondary);

export const likeButton = new ButtonBuilder()
    .setCustomId('like')
    .setEmoji('<:like:1186002205694763128>')
    .setStyle(ButtonStyle.Secondary);
export let loopButton: ButtonBuilder;

export let rowDefault: ActionRowBuilder;
export let rowLike: ActionRowBuilder;


let embedReply = new EmbedBuilder()
    .setColor(Keys.mainColor)

export const event = {
    name: 'trackStart',
    manager: true,
    async execute(player: Player, track: Track) {
        logMessage(`Track started in ${player.guild} with song ${track.uri}!`, true);

        let currentTrack = guildSongNewCache.get(player.guild);

        if (currentTrack !== undefined) {
            guildSongPreviousCache.set(player.guild, currentTrack);
        }

        guildSongNewCache.set(player.guild, track.uri);

        embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle('Now Playing')
            .setFooter({ text: `by ${track.author}` })
            .setThumbnail(track.thumbnail)
            .setDescription(`[**${track.title.replace(/[\p{Emoji}]/gu, '')}**](${track.uri}) - \`${prettyMilliseconds(track.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``)

        loopButton = new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji('<:loop1:1184916570917576806>')
            .setStyle(player.trackRepeat ? ButtonStyle.Success : ButtonStyle.Secondary);

        shuffleButton.setDisabled(false);
        pauseButton.setDisabled(false);
        resumeButton.setDisabled(false);
        skipButton.setDisabled(false);
        stopButton.setDisabled(false);
        loopButton.setDisabled(false);
        likeButton.setDisabled(false);

        rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
        rowLike = new ActionRowBuilder().addComponents([likeButton]);

        nowPlayingMessage = guildNowPlayingMessageCache.get(player.guild);

        let channel: TextChannel | undefined;
        try {
            if (nowPlayingMessage) {
                channel = await (await client.guilds.fetch(player.guild))!.channels.fetch(nowPlayingMessage.channelId) as TextChannel;
            } else {
                channel = await (await client.guilds.fetch(player.guild))!.channels.fetch(player.textChannel!) as TextChannel;
            }
        } catch {
            channel = undefined;
        }

        if (channel) {
            if (!nowPlayingMessage) {
                nowPlayingMessage = await channel.send({ embeds: [embed], components: [rowDefault as any, rowLike], flags: [4096] }).then(msg => {
                    guildNowPlayingMessageCache.set(player.guild, msg);
                    const collector = msg!.createMessageComponentCollector({ componentType: ComponentType.Button });
                    guildCollectorCache.set(player.guild, collector);
                    startCollector();
                    return msg;
                });
            } else {
                if (channel.lastMessage?.id === nowPlayingMessage?.id) {
                    nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
                } else {
                    nowPlayingMessage!.delete();
                    nowPlayingMessage = await channel.send({ embeds: [embed], components: [rowDefault as any, rowLike], flags: [4096] }).then(msg => {
                        guildNowPlayingMessageCache.set(player.guild, msg);
                        let collector = guildCollectorCache.get(player.guild)!;
                        collector.stop();
                        collector = msg!.createMessageComponentCollector({ componentType: ComponentType.Button });
                        guildCollectorCache.set(player.guild, collector);
                        startCollector();
                        return msg;
                    });
                }
            }
        } else {
            nowPlayingMessage = undefined;
            guildNowPlayingMessageCache.delete(player.guild);
            guildCollectorCache.get(player.guild)?.stop();
            guildCollectorCache.delete(player.guild);
            this.execute(player, track);
        }
    }
}

async function startCollector() {
    const collector = guildCollectorCache.get(player.guild)!;
    collector.on('collect', async interaction => {
        const player = client.manager.players.get(interaction.guildId!);
        if (!player) {
            embedReply.setDescription(`There is no player in this guild!`);
            interaction.reply({ embeds: [embedReply] });
            return collector.stop();
        };
        rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);

        embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle('Now Playing')
            .setFooter({ text: `by ${player.queue.current!.author}` })
            .setThumbnail(player.queue.current!.thumbnail!)
            .setDescription(`[**${player.queue.current!.title.replace(/[\p{Emoji}]/gu, '')}**](${player.queue.current!.uri}) - \`${prettyMilliseconds(player.queue.current!.duration!, { colonNotation: true, secondsDecimalDigits: 0 })}\``)

        loopButton = new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji('<:loop1:1184916570917576806>')
            .setStyle(player.trackRepeat ? ButtonStyle.Success : ButtonStyle.Secondary);

        shuffleButton.setDisabled(false);
        pauseButton.setDisabled(false);
        resumeButton.setDisabled(false);
        skipButton.setDisabled(false);
        stopButton.setDisabled(false);
        loopButton.setDisabled(false);
        likeButton.setDisabled(false);

        switch (interaction.customId) {
            case 'pause':
                player.pause(true);
                rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                interaction.update({ embeds: [embed], components: [rowDefault as any, rowLike] });
                break;
            case 'resume':
                player.pause(false);
                rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                interaction.update({ embeds: [embed], components: [rowDefault as any, rowLike] });
                break;
            case 'skip':
                player.stop();
                embedReply.setDescription(':fast_forward: Song skipped!');
                interaction.reply({ embeds: [embedReply] });
                break;
            case 'stop':
                player.queue.clear();
                player.stop();
                embedReply.setDescription('Disconnected from the voice channel.');
                interaction.reply({ embeds: [embedReply] });
                break;
            case 'shuffle':
                player.queue.shuffle();
                embedReply.setDescription(`Shuffled the queue!`);
                interaction.reply({ embeds: [embedReply] });
                break;
            case 'loop':
                player.setTrackRepeat(!player.trackRepeat);
                player.trackRepeat ? loopButton.setStyle(ButtonStyle.Success) : loopButton.setStyle(ButtonStyle.Secondary);
                rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                interaction.update({ embeds: [embed], components: [rowDefault as any, rowLike] });
                break;
            case 'like':
                let likedSongs = await modelLikedSongs.findOne({ userId: interaction.user.id });
                let playlistsModel = await playlistNames.findOne({ userId: interaction.user.id });
                let currentSong = guildSongNewCache.get(player.guild);

                if (!likedSongs) {
                    likedSongs = await modelLikedSongs.create({ userId: interaction.user.id, songs: [currentSong!] });
                    if (!playlistsModel) {
                        playlistsModel = await playlistNames.create({ userId: interaction.user.id, playlists: ['likedsongs'] });
                    } else {
                        playlistsModel.playlists.push('likedsongs');
                    }
                    logMessage(`Added ${guildSongNewCache.get(player.guild)} to ${interaction.user.id}'s liked songs!`, true);
                    embedReply.setDescription(`Added \`${player.queue.current?.title}\` to your liked songs playlist.`);
                    interaction.reply({ embeds: [embedReply], ephemeral: true });
                } else if (likedSongs?.songs.includes(currentSong!)) {
                    likedSongs.songs.splice(likedSongs.songs.indexOf(guildSongNewCache.get(player.guild)!), 1);
                    logMessage(`Removed ${guildSongNewCache.get(player.guild)} from ${interaction.user.id}'s liked songs!`, true);
                    embedReply.setDescription(`Removed \`${player.queue.current?.title}\` from your liked songs playlist.`);
                    interaction.reply({ embeds: [embedReply], ephemeral: true });
                } else {
                    likedSongs?.songs.push(currentSong!);
                    logMessage(`Added ${guildSongNewCache.get(player.guild)} to ${interaction.user.id}'s liked songs!`, true);
                    embedReply.setDescription(`Added \`${player.queue.current?.title}\` to your liked songs playlist.`);
                    interaction.reply({ embeds: [embedReply], ephemeral: true });
                }
                await likedSongs?.save();
                break;
        }
    });
}

export async function editFromCommand(command: string, message: Message | ChatInputCommandInteraction) {
    const player = client.manager.players.get(message.guildId!);
    if (!player) {
        embedReply.setDescription(`There is no player in this guild!`);
        message.reply({ embeds: [embedReply] });
        const collector = guildCollectorCache.get(message.guildId!)!;
        return collector.stop();
    };
    rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
    nowPlayingMessage = guildNowPlayingMessageCache.get(player.guild);

    embed = new EmbedBuilder()
        .setColor(Keys.mainColor)
        .setTitle('Now Playing')
        .setFooter({ text: `by ${player.queue.current!.author}` })
        .setThumbnail(player.queue.current!.thumbnail!)
        .setDescription(`[**${player.queue.current!.title.replace(/[\p{Emoji}]/gu, '')}**](${player.queue.current!.uri}) - \`${prettyMilliseconds(player.queue.current!.duration!, { colonNotation: true, secondsDecimalDigits: 0 })}\``)

    loopButton = new ButtonBuilder()
        .setCustomId('loop')
        .setEmoji('<:loop1:1184916570917576806>')
        .setStyle(player.trackRepeat ? ButtonStyle.Success : ButtonStyle.Secondary);

    shuffleButton.setDisabled(false);
    pauseButton.setDisabled(false);
    resumeButton.setDisabled(false);
    skipButton.setDisabled(false);
    stopButton.setDisabled(false);
    loopButton.setDisabled(false);
    likeButton.setDisabled(false);

    switch (command) {
        case 'pause':
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
            break;
        case 'resume':
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
            break;
        case 'loop':
            player.trackRepeat ? loopButton.setStyle(ButtonStyle.Success) : loopButton.setStyle(ButtonStyle.Secondary);
            rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
            break;
        case 'disconnect':
            shuffleButton.setDisabled(true);
            pauseButton.setDisabled(true);
            resumeButton.setDisabled(true);
            skipButton.setDisabled(true);
            stopButton.setDisabled(true);
            loopButton.setDisabled(true);
            likeButton.setDisabled(true);
            embed.setFooter({ text: `by ${player.queue.current?.author}  •  This message is inactive.` });
            rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
            player?.disconnect();
            player?.destroy();
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
            const collector = guildCollectorCache.get(message!.guildId!)!;
            collector.stop();
            break;
    }
}