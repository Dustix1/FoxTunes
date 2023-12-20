import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import Keys from "../../keys.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandMessage = {
    slash: false,
    name: 'resume',
    usage: '\`\`!resume\nNo available arguments\`\`',
    description: 'resumes the currently playing song.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseCommand(player, message, embed)) return;

        if (player!.playing) {
            embed.setColor(Colors.Blurple);
            embed.setDescription('Music is already playing!');
            return message.reply({ embeds: [embed] });
        }

        player!.pause(false);
        editFromCommand('resume', message);
        embed.setDescription(`:arrow_forward: Music resumed!`);
        message.reply({ embeds: [embed] });
    }
}