import { SlashCommandBuilder } from "discord.js";

export const command = {
    slash: true,
    usage: '\`\`/ping\nPossible Arguments: pong\`\`',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .addStringOption(option =>
            option.setName('pong')
            .setDescription('pong')
            .addChoices(
                { name: 'pong', value: 'pong' },
            )),
    async execute(interaction: any) {
        if (interaction.options.getString('pong') === 'pong') return interaction.reply('Ping!');
        await interaction.reply('Pong!');
    }
}