import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import modelLikedSongs from "../../models/likedSongs.js";
import prettyMilliseconds from "pretty-ms";
import { Track } from "magmastream";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/insert\nAvailable arguments: insert_position song_name_or_url\`\`',
    data: new SlashCommandBuilder()
        .setName('insert')
        .setDescription('Inserts a song into the queue.')
        .addNumberOption(option => option.setName('insert_position').setDescription('The position to insert the song at.').setRequired(true))
        .addStringOption(option => option.setName('song_name_or_url').setDescription('The song name or url to insert.').setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        let offset = interaction.options.getNumber('insert_position', true) - 1;

        const query = interaction.options.getString('song_name_or_url')!;

        if (offset < 0 || offset > player!.queue.length) {
            embed.setColor(Colors.Red);
            embed.setDescription("You need to provide a valid song position!");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply().then(async () => {
            let res: any;
            if (query.toLowerCase() === 'liked') {
                let likedSongs = await modelLikedSongs.findOne({ userId: interaction.user.id });
                if (!likedSongs) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no liked songs!`);
                    return await interaction.reply({ embeds: [embed] });
                }
                let likedSongsArray = likedSongs.songs;
                if (likedSongsArray.length === 0) {
                    embed.setColor(Colors.Red);
                    embed.setDescription(`You have no liked songs!`);
                    return await interaction.reply({ embeds: [embed] });
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
                    resLiked.playlist?.tracks.push((await player!.search(uri, interaction.user)).tracks[0] as Track);
                }));
                resLiked.playlist!.name = `${interaction.user.username}'s Liked Songs`;
                res = resLiked;
            } else {
                res = await player!.search(query, interaction.user);
            }

            switch (res.loadType) {
                case "empty":
                    embed.setColor(Colors.Red);
                    embed.setDescription(`Nothing found when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "error":
                    embed.setColor(Colors.Red);
                    embed.setDescription(`Load failed when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "track":
                    player!.queue.add(res.tracks[0], offset);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                    interaction.editReply({ embeds: [embed] });
                    break;

                case "playlist":
                    if (!res.playlist?.tracks) return;

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    player!.queue.add(res.playlist.tracks);

                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;

                case "liked":
                    if (!res.playlist?.tracks) return;

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added \`${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}\` with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    player!.queue.add(res.playlist.tracks);

                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;

                case "search":
                    player!.queue.add(res.tracks[0], offset);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                    interaction.editReply({ embeds: [embed] });
                    break;
            }
        });
    }
}