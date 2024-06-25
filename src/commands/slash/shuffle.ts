import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/shuffle\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffles the queue.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        player!.queue.shuffle();
        embed.setDescription(`:twisted_rightwards_arrows: Queue shuffled!`);
        interaction.reply({ embeds: [embed] });
    }
}