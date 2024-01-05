import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandMessage = {
    slash: false,
    name: 'skip',
    aliases: ['s'],
    usage: '\`\`!skip\nAvailable arguments: number_of_songs_to_skip/all\`\`',
    description: 'Skips a song.',
    group: 'musicPlayback',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseCommand(player, message, embed)) return;

        if (!args[0]) {
            player!.stop();
            embed.setDescription(':fast_forward: Song skipped!');
            message.reply({ embeds: [embed] });
        } else {
            let skipNumber;
            args[0].toLocaleLowerCase() === 'all' ? skipNumber = player!.queue.length + 1 : skipNumber = parseInt(args[0]!);
            if (isNaN(skipNumber)) {
                embed.setColor(Colors.Red);
                embed.setDescription('You need to provide a number!');
                return message.reply({ embeds: [embed] });
            }
            skipNumber = Math.abs(skipNumber);

            if (skipNumber > player!.queue.length) {
                player!.queue.clear();
                player!.stop();
            } else {
                player!.stop(skipNumber);
            }
            embed.setDescription(`:fast_forward: Skipped \`${skipNumber}\` songs!`);
            message.reply({ embeds: [embed] });
        }
    }
}