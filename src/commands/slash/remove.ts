import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandSlash = {
    slash: true,
    group: 'queueMgmt',
    usage: '\`\`/remove\nAvailable arguments: song_position\`\`',
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a song from the queue.')
        .addNumberOption(option => option.setName('position').setDescription('The song position.').setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        let songPosition = interaction.options.getNumber('position', true);
        if (songPosition < 1 || songPosition > player!.queue.length) {
            embed.setDescription('Please provide a valid song position.');
            embed.setColor(Colors.Red);
            return interaction.reply({ embeds: [embed] });
        }

        let song = player!.queue[songPosition - 1];
        player!.queue.remove(songPosition - 1);
        embed.setDescription(`Removed \`${song.title}\` from the queue.`);
        embed.setColor(Keys.mainColor);
        return interaction.reply({ embeds: [embed] });
    }
}