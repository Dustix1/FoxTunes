import { EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandMessage = {
    slash: false,
    name: 'loop',
    usage: '\`\`!loop\nAvailable arguments: queue\`\`',
    description: 'Loops the curent song/queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseCommand(player, message, embed)) return;

        if (!args[0]) {
            player!.setTrackRepeat(!player!.trackRepeat);
            editFromCommand('loop');
            embed.setDescription(`:repeat: Looping ${player!.trackRepeat ? 'enabled' : 'disabled'}!`);
            message.reply({ embeds: [embed] });
        } else {
            let loopQueue = args[0].toLowerCase() == 'queue' ? true : false;
            player!.setQueueRepeat(loopQueue);
            embed.setDescription(`:repeat: Queue Looping ${player!.queueRepeat ? 'enabled' : 'disabled'}!`);
            message.reply({ embeds: [embed] });
        }
    }
}