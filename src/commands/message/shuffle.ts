import { EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandMessage = {
    slash: false,
    name: 'shuffle',
    usage: '\`\`!shuffle\nNo available arguments\`\`',
    description: 'shuffles the queue.',
    group: 'queueMgmt',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseCommand(player, message, embed)) return;

        player!.queue.shuffle();
        embed.setDescription(`:twisted_rightwards_arrows: Queue shuffled!`);
        message.reply({ embeds: [embed] });
    }
}