import { Player, Track } from "magmastream";
import logMessage from "../../utils/logMessage.js";
import { ActionRowBuilder, EmbedBuilder } from "discord.js";
import Keys from "../../keys.js";
import client from "../../clientLogin.js";
import { TextBasedChannel } from "discord.js";
import { embed as embedNowPlaying, guildSongPreviousCache, likeButton, pauseButton, resumeButton, rowLike, shuffleButton, skipButton, stopButton, loopButton, guildCollectorCache, guildNowPlayingMessageCache } from "./trackStart.js";

export const event = {
    name: 'queueEnd',
    manager: true,
    async execute(player: Player, track: Track) {
        if (!player) return;
        guildSongPreviousCache.set(player.guild, track.uri);

        let date = new Date();
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        embed.setDescription('The queue has ended.')
            .setTimestamp(date);


        setTimeout(async () => {
            try {
                const nowPlayingMessage = guildNowPlayingMessageCache.get(player.guild);
                const channel = await(await client.guilds.fetch(player.guild)).channels.fetch(player.textChannel!) as TextBasedChannel
                shuffleButton.setDisabled(true);
                pauseButton.setDisabled(true);
                resumeButton.setDisabled(true);
                skipButton.setDisabled(true);
                stopButton.setDisabled(true);
                loopButton.setDisabled(true);
                likeButton.setDisabled(true);
                embedNowPlaying.setFooter({ text: nowPlayingMessage?.embeds[0].footer?.text + `   •   This message is inactive.` });
                const rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
                player.queue.clear();
                player.stop();
                //player.disconnect();
                guildCollectorCache.get(player.guild)?.stop();
                guildNowPlayingMessageCache.get(player.guild)?.edit({ embeds: [embedNowPlaying], components: [rowDefault as any, rowLike] });

                channel.send({ embeds: [embed] });
                guildNowPlayingMessageCache.delete(player!.guild);
            } catch {
                player.queue.clear();
                player.stop();
                player.disconnect();
                guildCollectorCache.get(player.guild)?.stop();
            }
        }, 1500);


        setTimeout(() => {
            logMessage(`Queue end timeout in ${player.guild}`, true)
            const newPlayer = client.manager.players.get(player.guild);
            if (!newPlayer) return;
            if (!newPlayer!.queue.current) {
                logMessage(`Destroying player in ${newPlayer!.guild}`, true);
                newPlayer!.disconnect();
                return newPlayer!.destroy();
            }
        }, 300000);
    }
}