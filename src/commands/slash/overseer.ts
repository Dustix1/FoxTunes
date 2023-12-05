import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js"
import { CommandSlash } from "../../structures/command.js"
import client from "../../clientLogin.js"

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/overseer\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('overseer')
        .setDescription('Overseer advertisement.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const overseerEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('The Overseer')
            .setDescription('Since FoxTunes doesn\'t support discord server management, FoxTunes administration is recommending you The Overseer. You can get him [here](https://discord.com/api/oauth2/authorize?client_id=1075792191135424572&permissions=8&scope=bot%20applications.commands).')
            .setThumbnail((await (await client.guilds.fetch('1021024367066493038')).members.fetch('1075792191135424572')).displayAvatarURL())

        interaction.reply({ embeds: [overseerEmbed] })
    }
}