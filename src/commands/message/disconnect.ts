import { Message, EmbedBuilder } from "discord.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { CommandMessage } from "../../structures/command.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";

export const command: CommandMessage = {
    slash: false,
    name: 'disconnect',
    aliases: ['dc'],
    usage: '\`\`!disconnect\nNo available arguments\`\`',
    description: 'Disconnects the bot from the voice channel.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
        if (!canUserUseCommand(player, message, embed)) return;

        player?.disconnect();
        player?.destroy();
        embed.setDescription('Disconnected from the voice channel.');
        message.channel.send({ embeds: [embed] });
    }
}