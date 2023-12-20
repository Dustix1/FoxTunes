import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors, GuildMember } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

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
            if (!player) {
                embed.setColor(Colors.Red);
                embed.setDescription("There is nothing playing in this guild! Play a song by using `/play` or `!play`");
                interaction.reply({ embeds: [embed], ephemeral: true });
                return false;
            }
            if ((interaction.member! as GuildMember).voice.channel != interaction.guild?.members.me?.voice.channel) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must be in the same voice channel as me to use this command. I'm in <#${interaction.guild?.members.me?.voice.channelId}>`);
                interaction.reply({ embeds: [embed], ephemeral: true });
                return false;
            }
            
        editFromCommand('disconnect', interaction);
        embed.setDescription('Disconnected from the voice channel.');
        interaction.reply({ embeds: [embed] });
    }
}