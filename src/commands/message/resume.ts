import { Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'resume',
    usage: '\`\`!resume\nNo available arguments\`\`',
    description: 'resumes the currently playing song.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        if (!player) return message.reply({ content: 'there is nothing playing in this guild!'});
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!'});
        if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) return message.reply({ content: 'you must be in the same voice channel as me to use this command!'});
        if (!player.queue.current) return message.reply({ content: 'there is nothing playing in this guild!'});

        if(player.playing) return message.reply({ content: 'The song is already playing!' });

        player.pause(false);
        message.reply({ content: 'Resuming song... :arrow_forward:' });
    }
}