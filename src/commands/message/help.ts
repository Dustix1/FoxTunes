import { Colors, EmbedBuilder, Message } from "discord.js";
import { commandsMessage, commandsSlash } from "../../utils/commands.js";
import { Keys } from "../../keys.js";
import client from "../../clientLogin.js";
import { CommandMessage } from "../../structures/command.js";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const command: CommandMessage = {
    slash: false,
    name: 'help',
    usage: '\`\`!help\nAvailable Arguments: command_name\`\`',
    description: 'List all commands or info about a specific command.',
    async execute(message: Message, args: any) {
        if(!args[0]) {
            let commandsM = '';
            commandsMessage.forEach(command => {
                if (!command.hidden) {
                    commandsM += `\`${command.name}\` - ${command.description}\n`;
                }
            });

            let helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle('Commands')
                .setDescription(commandsM)

            return message.channel.send({ embeds: [helpEmbed] });
        }
        
        let command = args[0].toLowerCase(); 
        if(!commandsMessage.has(command)) {
            let embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription('Command not found!\nUse `!help` or `/help` to list all commands.');
            return message.reply({ embeds: [embed] });
        }

        let helpEmbed;
        if (!commandsSlash.get(command)) {
            helpEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
            .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
            .setDescription(commandsMessage.get(command).description)
            .addFields(
                { name: 'Command Usage:', value: '*PREFIX COMMAND ONLY*\n' + commandsMessage.get(command).usage, inline: true }
            )
        } else {
            helpEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
            .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
            .setDescription(commandsMessage.get(command).description)
            .addFields(
                { name: 'Command Usage:', value: commandsMessage.get(command).usage, inline: true },
                { name: 'Slash Command Usage:', value: commandsSlash.get(command).usage, inline: true }
            )
        }

        message.channel.send({ embeds: [helpEmbed] });
            
    }
}