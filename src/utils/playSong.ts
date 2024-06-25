import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from "discord.js";
import { Player } from "magmastream";
import prettyMilliseconds from "pretty-ms";

export default async function playSong(res: any, player: Player, embed: EmbedBuilder, query?: string, message?: Message, interaction?: ChatInputCommandInteraction) {
    switch (res.loadType) {
        case "empty":
            if (!player!.queue.current) player!.destroy();

            embed.setColor(Colors.Red);
            embed.setDescription(`Nothing found when searching for \`${query}\``);
            if (interaction) await interaction.editReply({ embeds: [embed] });
            if (message) await message.reply({ embeds: [embed] });
            break;

        case "error":
            if (!player!.queue.current) player!.destroy();

            embed.setColor(Colors.Red);
            embed.setDescription(`Load failed when searching for \`${query}\``);
            if (interaction) await interaction.editReply({ embeds: [embed] });
            if (message) await message.reply({ embeds: [embed] });
            break;

        case "track":
            player!.queue.add(res.tracks[0]);

            if (player!.state !== 'CONNECTED') await player!.connect();

            embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
            if (interaction) interaction.editReply({ embeds: [embed] });
            if (message) message.reply({ embeds: [embed] });

            if (!player!.playing && !player!.paused && !player!.queue.length) {
                await player!.play();
            }
            break;

        case "playlist":
            if (!res.playlist?.tracks) return;

            if (player!.state !== 'CONNECTED') await player!.connect();

            embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
            player!.queue.add(res.playlist.tracks);

            if (interaction) interaction.editReply({ embeds: [embed] });
            if (message) message.reply({ embeds: [embed] });

            if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                await player!.play();
            }
            break;

        case "search":
            if (player!.state !== 'CONNECTED') await player!.connect();

            player!.queue.add(res.tracks[0]);

            embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
            if (interaction) interaction.editReply({ embeds: [embed] });
            if (message) message.reply({ embeds: [embed] });

            if (!player!.playing && !player!.paused && !player!.queue.length) {
                await player!.play();
            }
            break;
    }
}
