import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js"
import { CommandSlash } from "../../structures/command.js"
import client from "../../clientLogin.js"
import Keys from "../../keys.js"

export const command: CommandSlash = {
    slash: true,
    group: 'support',
    usage: '\`\`/support-server\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('support-server')
        .setDescription('Invites you to the support server.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setDescription('## You can join [here](https://discord.gg/TJ9XjTuV5N)\n### On the support server you can view your suggestion, reported issues, and participate in votes.')
            .setThumbnail(await client.guilds.fetch(Keys.foxtunesGuildID).then(guild => guild.iconURL()));

        return interaction.reply({ embeds: [embed] })
    }
}