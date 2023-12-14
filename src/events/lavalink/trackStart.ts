import { Player, Track } from "magmastream";
import client from "../../clientLogin.js";
import { ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ComponentType, EmbedBuilder, InteractionCollector, Message, TextChannel } from "discord.js";
import logMessage from "../../utils/logMessage.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import { player } from "../../structures/player.js";

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

        if (channel) {
            if (!nowPlayingMessage) {
                nowPlayingMessage = await channel.send({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, pauseButton, skipButton, stopButton, loopButton] }], flags: [4096] });
                collector = nowPlayingMessage.createMessageComponentCollector({ componentType: ComponentType.Button });
                startCollector(collector);
            } else {
                let channel = await (await client.guilds.fetch(player.guild))!.channels.fetch(player.textChannel!) as TextChannel;
                if (channel.lastMessage?.id === nowPlayingMessage?.id) {
                    nowPlayingMessage!.edit({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, pauseButton, skipButton, stopButton, loopButton] }] });
                } else {
                    nowPlayingMessage!.delete();
                    nowPlayingMessage = await channel.send({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, pauseButton, skipButton, stopButton, loopButton] }], flags: [4096] });
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
            nowPlayingMessage!.edit({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, resumeButton, skipButton, stopButton, loopButton] }] });
            break;
        case 'resume':
            nowPlayingMessage!.edit({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, pauseButton, skipButton, stopButton, loopButton] }] });
            break;
        case 'loop':
            player.trackRepeat ? loopButton.setStyle(ButtonStyle.Success) : loopButton.setStyle(ButtonStyle.Secondary);
            nowPlayingMessage!.edit({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton] }] });
            break;
    }
}

async function startCollector(collector: InteractionCollector<ButtonInteraction<CacheType>>) {
    collector.on('collect', interaction => {
        switch (interaction.customId) {
            case 'pause':
                player.pause(true);
                interaction.update({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, resumeButton, skipButton, stopButton, loopButton] }] });
                break;
            case 'resume':
                player.pause(false);
                interaction.update({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, pauseButton, skipButton, stopButton, loopButton] }] });
                break;
            case 'skip':
                player.stop();
                interaction.update({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton] }] });
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
                interaction.update({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, pauseButton, skipButton, stopButton, loopButton] }] });
                break;
            case 'shuffle':
                player.queue.shuffle();
                interaction.update({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton] }] });
                break;
            case 'loop':
                player.setTrackRepeat(!player.trackRepeat);
                player.trackRepeat ? loopButton.setStyle(ButtonStyle.Success) : loopButton.setStyle(ButtonStyle.Secondary);
                interaction.update({ embeds: [embed], components: [{ type: 1, components: [shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton] }] });
                break;
        }
    });
}