import { Player, Track } from "magmastream";
import logMessage from "../../utils/logMessage.js";
import { ActionRowBuilder, EmbedBuilder } from "discord.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import client from "../../clientLogin.js";
import { TextBasedChannel } from "discord.js";
import { embed as embedNowPlaying, guildSongPreviousCache, likeButton, pauseButton, resumeButton, rowLike, shuffleButton, skipButton, stopButton, embed, loopButton, guildCollectorCache, guildNowPlayingMessageCache } from "./trackStart.js";

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


        try {
            const channel = await (await client.guilds.fetch(player.guild)).channels.fetch(player.textChannel!) as TextBasedChannel
            shuffleButton.setDisabled(true);
            pauseButton.setDisabled(true);
            resumeButton.setDisabled(true);
            skipButton.setDisabled(true);
            stopButton.setDisabled(true);
            loopButton.setDisabled(true);
            likeButton.setDisabled(true);
            embedNowPlaying.setFooter({ text: `This message is inactive.` });
            const rowDefault = new ActionRowBuilder().addComponents([shuffleButton, (player.paused ? resumeButton : pauseButton), skipButton, stopButton, loopButton]);
            player.queue.clear();
            player.stop();
            player.disconnect();
            guildCollectorCache.get(player.guild)?.stop();
            guildNowPlayingMessageCache.get(player.guild)?.edit({ embeds: [embedNowPlaying], components: [rowDefault as any, rowLike] });
            guildNowPlayingMessageCache.delete(player.guild);
            channel.send({ embeds: [embed] });
        } catch {
            player.queue.clear();
            player.stop();
            player.disconnect();
            guildCollectorCache.get(player.guild)?.stop();
        }

        setTimeout(() => {
            if (!player.queue.current) {
                player.disconnect();
                return player.destroy();
            }
        }, 300000);
    }
}