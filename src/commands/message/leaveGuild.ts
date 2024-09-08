import { Message, EmbedBuilder } from "discord.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'leaveguild',
    usage: '\`\`!leaveguild\nAvailable arguments: guild_id\`\`',
    description: 'Leave a guild.',
    group: 'general',
    hidden: true,
    async execute(message: Message, args: any) {
        if (!message.inGuild()) return;
        if (message.author.id !== Keys.ownerID) return;
        const guild = client.guilds.cache.get(args[0]);
        if (!guild) return message.channel.send('Guild not found.');
        await guild.leave();
        message.channel.send(`Left guild: ${guild.name}`);
    }
}