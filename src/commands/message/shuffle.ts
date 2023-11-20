import { Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'shuffle',
    usage: '\`\`!shuffle\nNo available arguments\`\`',
    description: 'shuffles the queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        if (!player) return message.reply({ content: 'there is nothing playing in this guild!'});
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!'});
        if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) return message.reply({ content: 'you must be in the same voice channel as me to use this command!'});
        if (!player.queue.current) return message.reply({ content: 'there is nothing playing in this guild!'});

        player.queue.shuffle();
        message.reply({ content: 'Shuffling queue... :twisted_rightwards_arrows:' });
    }
}