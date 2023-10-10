import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import { Keys } from "../../keys.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/guilds\nNo available Arguments.\`\`',
    hidden: true,
    data: new SlashCommandBuilder()
        .setName('guilds')
        .setDescription('List all available guilds.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let guilds = '';
        client.guilds.cache.forEach(guild => {
            guilds += `${guild.name} - ${guild.id}\n`;
        });

        let guildsEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle('Guilds')
            .setDescription(guilds);

        interaction.reply({ embeds: [guildsEmbed] });
    }
}