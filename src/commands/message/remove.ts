import { Message, EmbedBuilder, Colors } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandMessage = {
    slash: false,
    name: 'remove',
    aliases: ['rm', 'delete', 'del', 'remove-song', 'rm-song', 'delete-song', 'del-song'],
    usage: '\`\`!remove\nAvailable arguments: song_position\`\`',
    description: 'Removes a song from the queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
        if (!canUserUseCommand(player, message, embed)) return;

        if (!args[0]) {
            embed.setDescription('Please provide a song position.');
            embed.setColor(Colors.Red);
            return message.reply({ embeds: [embed] });
        }

        if (isNaN(args[0])) {
            embed.setDescription('Please provide a valid song position.');
            embed.setColor(Colors.Red);
            return message.reply({ embeds: [embed] });
        }

        let songPosition = Number(args[0]);
        if (songPosition < 1 || songPosition > player!.queue.length) {
            embed.setDescription('Please provide a valid song position.');
            embed.setColor(Colors.Red);
            return message.reply({ embeds: [embed] });
        }

        let song = player!.queue[songPosition - 1];
        player!.queue.remove(songPosition - 1);
        embed.setDescription(`Removed \`${song.title}\` from the queue.`);
        embed.setColor(Keys.mainColor);
        message.reply({ embeds: [embed] });
    }
}