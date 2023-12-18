import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import prettyMilliseconds from "pretty-ms";
import { Track } from "magmastream";
import modelLikedSongs from "../../models/likedSongs.js";

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

        let res: any;

        if (query.toLowerCase() === 'liked') {
            let likedSongs = await modelLikedSongs.findOne({ userId: message.author.id });
            if (!likedSongs) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no liked songs!`);
                return await message.reply({ embeds: [embed] });
            }
            let likedSongsArray = likedSongs.songs;
            if (likedSongsArray.length === 0) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You have no liked songs!`);
                return await message.reply({ embeds: [embed] });
            }
            let resLiked = {
                loadType: 'liked',
                playlist: {
                    name: '',
                    tracks: [] as Track[],
                    duration: 0
                }
            };
            await Promise.all(likedSongsArray.map(async uri => {
                resLiked.playlist?.tracks.push((await player!.search(uri, message.author)).tracks[0] as Track);
            }));
            resLiked.playlist!.name = `${message.author.username}'s Liked Songs`;
            res = resLiked;
        } else {
            res = await player!.search(query, message.author);
        }

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

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                message.reply({ embeds: [embed] });
                break;

            case "playlist":
                if (!res.playlist?.tracks) return;

                player!.queue.add(res.playlist.tracks, offset);

                embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue at position \`${offset + 1}\`.`);
                message.reply({ embeds: [embed] });
                break;

            case "liked":
                if (!res.playlist?.tracks) return;

                player!.queue.add(res.playlist.tracks, offset);

                embed.setDescription(`Added \`${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}\` with \`${res.playlist.tracks.length}\` tracks to the queue at position \`${offset + 1}\`.`);
                message.reply({ embeds: [embed] });
                break;

            case "search":
                player!.queue.add(res.tracks[0], offset);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                message.reply({ embeds: [embed] });
                break;
        }
    }
}