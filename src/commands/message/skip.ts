import { Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandMessage = {
    slash: false,
    name: 'skip',
    usage: '\`\`!skip\nAvailable arguments: number_of_songs_to_skip/all\`\`',
    description: 'Skips a song.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        if (!player) return message.reply({ content: 'there is nothing playing in this guild!'});
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!'});
        if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) return message.reply({ content: 'you must be in the same voice channel as me to use this command!'});
        if (!player.queue.current) return message.reply({ content: 'there is nothing playing in this guild!'});

        if (!args[0]) {
            player.stop();
            message.reply({ content: 'Skipping song...' });
        } else {
            let skipNumber;
            args[0].toLocaleLowerCase() === 'all' ? skipNumber = player.queue.length + 1 : skipNumber = parseInt(args[0]!);
            if (isNaN(skipNumber)) return message.reply('Please provide a number.');
            skipNumber = Math.abs(skipNumber);

            if (skipNumber > player.queue.length) {
                skipNumber = player.queue.length + 1;
                player.queue.clear();
                player.stop();
            } else {
                player.stop(skipNumber);
            }
            message.reply({ content: `Skipping ${skipNumber} songs...` });
        }
    }
}