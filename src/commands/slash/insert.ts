import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import logMessage from "../../utils/logMessage.js";
import prettyMilliseconds from "pretty-ms";

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
            return interaction.reply({ embeds: [embed], ephemeral: true});
        }

        const res = await player!.search(query, interaction.user);

        logMessage(res.loadType, true);

        switch (res.loadType) {
            case "empty":
                embed.setColor(Colors.Red);
                embed.setDescription(`Nothing found when searching for \`${query}\``);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case "error":
                embed.setColor(Colors.Red);
                embed.setDescription(`Load failed when searching for \`${query}\``);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case "track":
                player!.queue.add(res.tracks[0], offset);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, {colonNotation: true})}\``);
                interaction.reply({ embeds: [embed] });
                break;

            case "playlist":
                if (!res.playlist?.tracks) return;

                player!.queue.add(res.playlist.tracks, offset);

                embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue at position \`${offset + 1}\`.`);
                interaction.reply({ embeds: [embed] });
                break;

            case "search":
                player!.queue.add(res.tracks[0], offset);

                embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue at position \`${offset + 1}\` - \`${prettyMilliseconds(res.tracks[0].duration, {colonNotation: true})}\``);
                interaction.reply({ embeds: [embed] });
                break;
        }
    }
}