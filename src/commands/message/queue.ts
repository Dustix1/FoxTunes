import { EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";

export const command: CommandMessage = {
    slash: false,
    name: 'queue',
    usage: '\`\`!queue\nAvailable arguments: number_of_songs_to_skip\`\`',
    description: 'Lists the queue.',
    async execute(message: Message, args: any) {
        let queueEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle('Commands')
    }
}