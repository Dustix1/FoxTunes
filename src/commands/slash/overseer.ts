import { SlashCommandBuilder, EmbedBuilder } from "discord.js"

export const command = {
    slash: true,
    usage: '\`\`/overseer\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('overseer')
        .setDescription('Overseer advertisement.'),
    async execute(interaction: any) {
        const overseerEmbed = new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle('The Overseer')
            .setDescription('Since [PH BOT NAME] doesn\'t support discord server management, [PH BOT NAME] administration is recommending you The Overseer. You can get him [here](https://discord.com/api/oauth2/authorize?client_id=1075792191135424572&permissions=8&scope=bot%20applications.commands).')
            .setThumbnail('https://i.ibb.co/ySSYwbF/newoverseerlogo2.png')

        interaction.reply({ embeds: [overseerEmbed] })
    }
}