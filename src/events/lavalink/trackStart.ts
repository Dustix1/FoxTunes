import { Player, Track } from "magmastream";
import client from "../../clientLogin.js";
import { TextChannel } from "discord.js";

export const event = {
    name: 'trackStart',
    manager: true,
    async execute(player: Player, track: Track) {
        const channel = await (await client.guilds.fetch(player.guild))!.channels.fetch(player.textChannel!) as TextChannel;
        if (channel) {
            return (await channel.send(`Now playing: [**${track.title.replace(/[^\x20-\x7E]/g, '')}**](${track.uri})`)).suppressEmbeds();
        }
    }
}