import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandSlash = {
    slash: true,
    group: 'musicPlayback',
    usage: '\`\`/resume\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resumes the currently playing song.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        if (player!.playing) {
            embed.setColor(Colors.Blurple);
            embed.setDescription('Music is already playing!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        player!.pause(false);
        editFromCommand('resume', interaction);
        embed.setDescription(`:arrow_forward: Music resumed!`);
        return interaction.reply({ embeds: [embed] });
    }
}