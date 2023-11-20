import { Message, EmbedBuilder } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'guilds',
    usage: '\`\`!guilds\nNo available arguments.\`\`',
    description: 'List all available guilds.',
    hidden: true,
    async execute(message: Message, args: any) {
        if (message.author.id !== Keys.ownerID) return;
        let guilds = '';
        client.guilds.cache.forEach(guild => {
            guilds += `${guild.name} - ${guild.id}\n`;
        });

        let guildsEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle('Guilds')
            .setDescription(guilds);

        message.channel.send({ embeds: [guildsEmbed] });
    }
}