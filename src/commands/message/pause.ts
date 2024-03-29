import { Colors, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";
import { editFromCommand } from "../../events/lavalink/trackStart.js";

export const command: CommandMessage = {
    slash: false,
    name: 'pause',
    aliases: ['stop'],
    usage: '\`\`!pause\nNo available arguments\`\`',
    description: 'Pauses the currently playing song.',
    group: 'musicPlayback',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseCommand(player, message, embed)) return;

        if (!player!.playing) {
            embed.setColor(Colors.Blurple);
            embed.setDescription('The song is already paused!\nUse \`!resume\` or \`/resume\` to resume the song');
            return message.reply({ embeds: [embed] });
        }

        player!.pause(true);
        editFromCommand('pause', message);
        embed.setDescription(`:pause_button: Music paused!\nUse \`!resume\` or \`/resume\` to resume the song`);
        message.reply({ embeds: [embed] });
    }
}