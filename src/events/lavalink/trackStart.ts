import { Player, Track } from "magmastream";
import client from "../../clientLogin.js";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ComponentType, EmbedBuilder, InteractionCollector, Message, TextChannel } from "discord.js";
import logMessage from "../../utils/logMessage.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import { player } from "../../structures/player.js";
import model from "../../models/likedSongs.js";

export const guildSongPreviousCache = new Map<string, string>();
export const guildSongNewCache = new Map<string, string>();

let nowPlayingMessage: Message | undefined;
let embed: EmbedBuilder;
let pauseButton: ButtonBuilder;
let resumeButton: ButtonBuilder;
let skipButton: ButtonBuilder;
let stopButton: ButtonBuilder;
let shuffleButton: ButtonBuilder;
let loopButton: ButtonBuilder;
let likeButton: ButtonBuilder;
let rowDefault: ActionRowBuilder;
let rowPaused: ActionRowBuilder;
let rowSkip: ActionRowBuilder;
let rowLike: ActionRowBuilder;
let collector: InteractionCollector<ButtonInteraction<CacheType>>;

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

        const channel = await (await client.guilds.fetch(player.guild))!.channels.fetch(player.textChannel!) as TextChannel;
        embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle('Now Playing')
            .setFooter({ text: `by ${track.author}` })
            .setThumbnail(track.thumbnail)
            .setDescription(`[**${track.title.replace(/[\p{Emoji}]/gu, '')}**](${track.uri}) - \`${prettyMilliseconds(track.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``)

        pauseButton = new ButtonBuilder()
            .setCustomId('pause')
            .setEmoji('<:pause:1184910921823436800>')
            .setStyle(ButtonStyle.Secondary);

        resumeButton = new ButtonBuilder()
            .setCustomId('resume')
            .setEmoji('<:play:1184911090681921596>')
            .setStyle(ButtonStyle.Success);

        skipButton = new ButtonBuilder()
            .setCustomId('skip')
            .setEmoji('<:skipforward:1184913006325420032>')
            .setStyle(ButtonStyle.Secondary);

        stopButton = new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji('<:stop:1184914230445613117>')
            .setStyle(ButtonStyle.Secondary);

        shuffleButton = new ButtonBuilder()
            .setCustomId('shuffle')
            .setEmoji('<:shuffle1:1184916558712160351>')
            .setStyle(ButtonStyle.Secondary);

        loopButton = new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji('<:loop1:1184916570917576806>')
            .setStyle(player.trackRepeat ? ButtonStyle.Success : ButtonStyle.Secondary);

        likeButton = new ButtonBuilder()
            .setCustomId('like')
            .setEmoji('<:like:1186002205694763128>')
            .setStyle(ButtonStyle.Secondary);

        rowDefault = new ActionRowBuilder().addComponents([shuffleButton, pauseButton, skipButton, stopButton, loopButton]);
        rowPaused = new ActionRowBuilder().addComponents([shuffleButton, resumeButton, skipButton, stopButton, loopButton]);
        rowLike = new ActionRowBuilder().addComponents([likeButton]);

        if (channel) {
            if (!nowPlayingMessage) {
                nowPlayingMessage = await channel.send({ embeds: [embed], components: [rowDefault as any, rowLike], flags: [4096] });
                collector = nowPlayingMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                startCollector(collector);
            } else {
                let channel = await (await client.guilds.fetch(player.guild))!.channels.fetch(player.textChannel!) as TextChannel;
                if (channel.lastMessage?.id === nowPlayingMessage?.id) {
                    nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
                } else {
                    nowPlayingMessage!.delete();
                    nowPlayingMessage = await channel.send({ embeds: [embed], components: [rowDefault as any, rowLike], flags: [4096] });
                    collector.stop();
                    collector = nowPlayingMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                    startCollector(collector);
                }
            }
        }
    }
}

export async function editFromCommand(command: string) {
    switch (command) {
        case 'pause':
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowPaused as any, rowLike] });
            break;
        case 'resume':
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
            break;
        case 'loop':
            player.trackRepeat ? loopButton.setStyle(ButtonStyle.Success) : loopButton.setStyle(ButtonStyle.Secondary);
            rowSkip = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowSkip as any, rowLike] });
            break;
        case 'disconnect':
            shuffleButton.setDisabled(true);
            pauseButton.setDisabled(true);
            resumeButton.setDisabled(true);
            skipButton.setDisabled(true);
            stopButton.setDisabled(true);
            loopButton.setDisabled(true);
            embed.setFooter({ text: `by ${player.queue.current?.author}  •  This message is inactive.` });
            nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
            collector.stop();
            break;
        case 'skip':
            if (player.queue[0]) {
                rowSkip = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                nowPlayingMessage!.edit({ embeds: [embed], components: [rowSkip as any, rowLike] });
            } else {
                shuffleButton.setDisabled(true);
                pauseButton.setDisabled(true);
                resumeButton.setDisabled(true);
                skipButton.setDisabled(true);
                stopButton.setDisabled(true);
                loopButton.setDisabled(true);
                embed.setFooter({ text: `This message is inactive.` });
                nowPlayingMessage!.edit({ embeds: [embed], components: [rowDefault as any, rowLike] });
                collector.stop();
            }
    }
}

async function startCollector(collector: InteractionCollector<ButtonInteraction<CacheType>>) {
    collector.on('collect', async interaction => {
        switch (interaction.customId) {
            case 'pause':
                player.pause(true);
                interaction.update({ embeds: [embed], components: [rowPaused as any, rowLike] });
                break;
            case 'resume':
                player.pause(false);
                interaction.update({ embeds: [embed], components: [rowDefault as any, rowLike] });
                break;
            case 'skip':
                if (player.queue[0]) {
                    player.stop();
                    rowSkip = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                    interaction.update({ embeds: [embed], components: [rowSkip as any, rowLike] });
                } else {
                    shuffleButton.setDisabled(true);
                    pauseButton.setDisabled(true);
                    resumeButton.setDisabled(true);
                    skipButton.setDisabled(true);
                    stopButton.setDisabled(true);
                    loopButton.setDisabled(true);
                    embed.setFooter({ text: `This message is inactive.` });
                    player.queue.clear();
                    player.stop();
                    interaction.update({ embeds: [embed], components: [rowDefault as any, rowLike] });
                    collector.stop();
                }
                break;
            case 'stop':
                shuffleButton.setDisabled(true);
                pauseButton.setDisabled(true);
                resumeButton.setDisabled(true);
                skipButton.setDisabled(true);
                stopButton.setDisabled(true);
                loopButton.setDisabled(true);
                embed.setFooter({ text: `by ${player.queue.current?.author}  •  This message is inactive.` });
                player.queue.clear();
                player.stop();
                player.disconnect();
                interaction.update({ embeds: [embed], components: [rowDefault as any, rowLike] });
                collector.stop();
                break;
            case 'shuffle':
                player.queue.shuffle();
                interaction.reply({ content: 'Shuffled the queue!' });
                break;
            case 'loop':
                player.setTrackRepeat(!player.trackRepeat);
                player.trackRepeat ? loopButton.setStyle(ButtonStyle.Success) : loopButton.setStyle(ButtonStyle.Secondary);
                rowSkip = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                interaction.update({ embeds: [embed], components: [rowSkip as any, rowLike] });
                break;
            case 'like':
                let likedSongs = await model.findOne({ userId: interaction.user.id });
                let currentSong = guildSongNewCache.get(player.guild);

                if (!likedSongs) {
                    likedSongs = await model.create({ userId: interaction.user.id, songs: [currentSong!] });
                    logMessage(`Added ${guildSongNewCache.get(player.guild)} to ${interaction.user.id}'s liked songs!`, true);
                    interaction.reply({ content: `Added \`${player.queue.current?.title}\` to your liked songs playlist.`, ephemeral: true });
                } else if (likedSongs?.songs.includes(currentSong!)) {
                    likedSongs.songs.splice(likedSongs.songs.indexOf(guildSongNewCache.get(player.guild)!), 1);
                    logMessage(`Removed ${guildSongNewCache.get(player.guild)} from ${interaction.user.id}'s liked songs!`, true);
                    interaction.reply({ content: `Removed \`${player.queue.current?.title}\` from your liked songs playlist.`, ephemeral: true });
                } else {
                    likedSongs?.songs.push(currentSong!);
                    logMessage(`Added ${guildSongNewCache.get(player.guild)} to ${interaction.user.id}'s liked songs!`, true);
                    interaction.reply({ content: `Added \`${player.queue.current?.title}\` to your liked songs playlist.`, ephemeral: true });
                }
                await likedSongs?.save();
                break;
        }
    });
}