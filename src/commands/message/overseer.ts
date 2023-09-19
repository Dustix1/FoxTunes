import { EmbedBuilder } from "discord.js";

export const command = {
    slash: false,
    name: 'overseer',
    usage: '\`\`!overseer\nNo available Arguments.\`\`',
    description: 'Overseer advertisement.',
    async execute(message: any, args: any) {
        const overseerEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('The Overseer')
            .setDescription('Since FoxTunes doesn\'t support discord server management, FoxTunes administration is recommending you The Overseer. You can get him [here](https://discord.com/api/oauth2/authorize?client_id=1075792191135424572&permissions=8&scope=bot%20applications.commands).')
            .setThumbnail('https://i.ibb.co/ySSYwbF/newoverseerlogo2.png')

        message.channel.send({ embeds: [overseerEmbed] })
    }
}