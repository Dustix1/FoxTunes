import { SlashCommandBuilder } from "discord.js";

export const command = {
    slash: true,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction: any) {
        await interaction.reply('Pong!');
    }
}