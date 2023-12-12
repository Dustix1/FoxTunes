import { Player, Track } from "magmastream";
import client from "../../clientLogin.js";
import { TextChannel } from "discord.js";
import logMessage from "../../utils/logMessage.js";

export const guildSongPreviousCache = new Map<string, string>();
export const guildSongNewCache = new Map<string, string>();

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
        if (channel) {
            channel.send(`Now playing: [**${track.title.replace(/[\p{Emoji}]/gu, '')}**](${track.uri})`).then((msg) => {
                setTimeout(() => {
                    return msg.suppressEmbeds();
                }, 2000);
            });
        }
    }
}