import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/loop\nAvailable arguments: queue\`\`',
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops the current song/queue.')
        .addStringOption(option =>
            option
                .setName('queue')
                .setDescription('loop the queue.')
                .setRequired(false)
                .addChoices({ name: 'queue', value: 'queue' } as const)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        if (!interaction.options.getString('queue')) {
            player!.setTrackRepeat(!player!.trackRepeat);
            embed.setDescription(`:repeat: Looping ${player!.trackRepeat ? 'enabled' : 'disabled'}!`);
            interaction.reply({ embeds: [embed] });
        } else {
            player!.setQueueRepeat(!player!.queueRepeat);
            embed.setDescription(`:repeat: Queue Looping ${player!.queueRepeat ? 'enabled' : 'disabled'}!`);
            interaction.reply({ embeds: [embed] });
        }
    }
}