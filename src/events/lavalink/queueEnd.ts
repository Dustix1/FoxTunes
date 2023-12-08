import { Player, Track } from "magmastream";
import logMessage from "../../utils/logMessage.js";
import { EmbedBuilder } from "discord.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import client from "../../clientLogin.js";
import { TextBasedChannel } from "discord.js";

export const event = {
    name: 'queueEnd',
    manager: true,
    async execute(player: Player, track: Track) {
        if (!player) return;

        let date = new Date();
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        embed.setDescription('The queue has ended.')
            .setTimestamp(date);


        client.channels.fetch(player.textChannel!).then(channel => {
            (channel as TextBasedChannel).send({ embeds: [embed] });
        });

        setTimeout(() => {
            if (!player.queue.current) {
                player.disconnect();
                return player.destroy();
            }
        }, 300000);
    }
}