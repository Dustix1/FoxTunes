import { Message, EmbedBuilder } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'guilds',
    usage: '\`\`!guilds\nNo available arguments.\`\`',
    description: 'List all available guilds.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        if (!message.inGuild()) return;
        if (message.author.id !== Keys.ownerID) return;
        let guilds = '';
        let guildCount = 0;
        client.guilds.cache.forEach(guild => {
            guilds += `${guild.name} - ${guild.id}\n`;
            guildCount++;
        });

        let guildsEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle(`Guilds (${guildCount})`)
            .setDescription(guilds);

        message.channel.send({ embeds: [guildsEmbed] });
    }
}