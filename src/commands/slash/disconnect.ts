import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/disconnect\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects the bot from the voice channel.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        player?.disconnect();
        player?.destroy();
        
        embed.setDescription('Disconnected from the voice channel.');
        interaction.reply({ embeds: [embed] });
    }
}