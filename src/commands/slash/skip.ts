import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import Keys from "../../keys.js";

export const command: CommandSlash = {
    slash: true,
    group: 'musicPlayback',
    usage: '\`\`/skip\nAvailable arguments: number_of_songs_to_skip/all\`\`',
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips a song or multiple songs.')
        .addStringOption(option =>
            option.setName('skipnumber')
                .setDescription('how many songs to skip.')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        if (!interaction.options.getString('skipnumber')) {
            player!.stop();
            embed.setDescription(':fast_forward: Song skipped!');
            return interaction.reply({ embeds: [embed] });
        } else {
            let skipNumber;
            interaction.options.getString('skipnumber')?.toLocaleLowerCase() === 'all' ? skipNumber = player!.queue.length + 1 : skipNumber = parseInt(interaction.options.getString('skipnumber')!);
            if (isNaN(skipNumber)) {
                embed.setColor(Colors.Red);
                embed.setDescription('You need to provide a number!');
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            skipNumber = Math.abs(skipNumber);

            if (skipNumber > player!.queue.length) {
                player!.queue.clear();
                player!.stop();
            } else {
                player!.stop(skipNumber);
            }
            embed.setDescription(`:fast_forward: Skipped \`${skipNumber}\` songs!`);
            return interaction.reply({ embeds: [embed] });
        }
    }
}