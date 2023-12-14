import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/pause\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the currently playing song.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        if (!player!.playing) {
            embed.setColor(Colors.Blurple);
            embed.setDescription('The song is already paused!\nUse \`!resume\` or \`/resume\` to resume the song');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        player!.pause(true);
        editFromCommand('pause');
        embed.setDescription(`:pause_button: Music paused!\nUse \`!resume\` or \`/resume\` to resume the song`);
        interaction.reply({ content: ':pause_button: Music paused!\nUse \`!resume\` or \`/resume\` to resume the song' });
    }
}