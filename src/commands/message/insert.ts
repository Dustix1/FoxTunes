import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import logMessage from "../../utils/logMessage.js";
import millisecondsToTime from "../../utils/msToTime.js";

export const command: CommandMessage = {
    slash: false,
    name: 'insert',
    aliases: ['add', 'insert-song', 'add-song'],
    usage: '\`\`!insert\nAvailable arguments: insert_position song_name_or_url\`\`',
    description: 'Inserts a song into the queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
        if (!canUserUseCommand(player, message, embed)) return;

        const query = message.content.split(' ').slice(2).join(' ');

        if (!args[0]) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a song position!");
            return message.reply({ embeds: [embed] });
        }

        if (isNaN(args[0])) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a valid song position!");
            return message.reply({ embeds: [embed] });
        }

        if (!query) {
            embed.setColor(Colors.Blurple);
            embed.setDescription("You need to provide a song name or url!");
            return message.reply({ embeds: [embed] });
        }

        let offset = Number(args[0]) - 1;

        if (offset < 0 || offset > player!.queue.length) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a valid song position!");
            return message.reply({ embeds: [embed] });
        }

        const res = await player!.search(query, message.author);

        logMessage(res.loadType, true);

        switch (res.loadType) {
            case "empty":
                embed.setColor(Colors.Red);
                embed.setDescription(`Nothing found when searching for \`${query}\``);
                await message.reply({ embeds: [embed] });
                break;

            case "error":
                embed.setColor(Colors.Red);
                embed.setDescription(`Load failed when searching for \`${query}\``);
                await message.reply({ embeds: [embed] });
                break;

            case "track":
                player!.queue.add(res.tracks[0], offset);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${millisecondsToTime(res.tracks[0].duration)}\``);
                message.reply({ embeds: [embed] });
                break;

            case "playlist":
                if (!res.playlist?.tracks) return;

                player!.queue.add(res.playlist.tracks, offset);

                embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue at position \`${offset + 1}\`.`);
                message.reply({ embeds: [embed] });
                break;

            case "search":
                player!.queue.add(res.tracks[0], offset);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${millisecondsToTime(res.tracks[0].duration)}\``);
                message.reply({ embeds: [embed] });
                break;
        }
    }
}