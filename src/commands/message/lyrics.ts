import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import Genius from "genius-lyrics";

export const command: CommandMessage = {
    slash: false,
    name: 'lyrics',
    aliases: ['text'],
    usage: '\`\`!lyrics\nNo available arguments.\`\`',
    description: 'Finds the lyrics of the currently playing song.',
    group: 'musicPlayback',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor);
        if (!canUserUseCommand(player, message, embed)) return;
        const Client = new Genius.Client();

        embed.setColor(Colors.Blurple)
            .setDescription('searching for lyrics...\nThis may take a while.');
        const msg = message.reply({ embeds: [embed] });

        const search = await Client.songs.search(player!.queue.current!.title);
        if (search.length == 0) {
            embed.setColor(Colors.Red);
            embed.setDescription(`Couldn't find lyrics for \`${player!.queue.current!.title}\``);
            return (await msg).edit({ embeds: [embed] });
        }

        let lyrics = await search[0].lyrics();
        if(lyrics.length > 4096) lyrics = lyrics.slice(0, 4096);
        embed.setDescription(lyrics);
        if (!lyrics) {
            embed.setDescription(`Couldn't find lyrics for \`${player!.queue.current!.title}\``);
            embed.setColor(Colors.Red);
        }
        embed.setTitle('Lyrics for ' + search[0].title)
            .setAuthor({ name: 'Please note that this may not be accurate.', iconURL: client.user?.displayAvatarURL() })
            .setColor(Keys.mainColor)
            .setThumbnail(player!.queue.current!.thumbnail!)
            .setFooter({ text: 'Lyrics from: ' + search[0].url });
        (await msg).edit({ embeds: [embed] });
    }
}