import { Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'loop',
    usage: '\`\`!loop\nAvailable arguments: queue\`\`',
    description: 'Loops the curent song/queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        if (!player) return message.reply({ content: 'there is nothing playing in this guild!'});
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!'});
        if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) return message.reply({ content: 'you must be in the same voice channel as me to use this command!'});
        if (!player.queue.current) return message.reply({ content: 'there is nothing playing in this guild!'});

        if (!args[0]) {
            player.setTrackRepeat(!player.trackRepeat);
            message.reply({ content: `Looping ${player.trackRepeat ? 'enabled' : 'disabled'}!` });
        } else {
            let loopQueue = args[0].toLowerCase() == 'queue' ? true : false;
            player.setQueueRepeat(loopQueue);
            message.reply({ content: `Queue Looping ${player.queueRepeat ? 'enabled' : 'disabled'}!` });
        }
    }
}