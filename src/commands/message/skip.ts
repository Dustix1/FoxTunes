import { Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import { player } from "../../structures/player.js";

export const command: CommandMessage = {
    slash: false,
    name: 'skip',
    usage: '\`\`!skip\nNo available Arguments.\`\`',
    description: 'Skips a song.',
    async execute(message: Message, args: any) {
        if (!player) return message.reply({ content: 'there is nothing playing in this guild!'});
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!'});
        if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) return message.reply({ content: 'you must be in the same voice channel as me to use this command!'});
        if (!player.queue.current) return message.reply({ content: 'there is nothing playing in this guild!'});
    }
}