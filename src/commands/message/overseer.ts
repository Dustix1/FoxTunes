import { EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandMessage = {
    slash: false,
    name: 'overseer',
    usage: '\`\`!overseer\nNo available Arguments.\`\`',
    description: 'Overseer advertisement.',
    async execute(message: Message, args: any) {
        const overseerEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('The Overseer')
            .setDescription('Since FoxTunes doesn\'t support discord server management, FoxTunes administration is recommending you The Overseer. You can get him [here](https://discord.com/api/oauth2/authorize?client_id=1075792191135424572&permissions=8&scope=bot%20applications.commands).')
            .setThumbnail((await (await client.guilds.fetch('1021024367066493038')).members.fetch('1075792191135424572')).displayAvatarURL())

        message.channel.send({ embeds: [overseerEmbed] })
    }
}