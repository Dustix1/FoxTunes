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
    aliases: ['h'],
    usage: '\`\`!help\nAvailable Arguments: command_name\`\`',
    description: 'List all commands or info about a specific command.',
    async execute(message: Message, args: any) {
        if (!args[0]) {
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
        if (!commandsMessage.has(command)) {
            let hasAlias = false;
            commandsMessage.forEach((actualCommand, key) => {
                if (!hasAlias && actualCommand.aliases) {
                    actualCommand.aliases.forEach((alias: any) => {
                        if (alias === command) {
                            hasAlias = true;
                            command = key;
                        }
                    });
                }
            });
            if (!hasAlias) {
                let embed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Command not found!\nUse `!help` or `/help` to list all commands.');
                return message.reply({ embeds: [embed] });
            }
        }

        let helpEmbed;
        if (commandsMessage.get(command).aliases) {
            if (!commandsSlash.get(command)) {
                helpEmbed = new EmbedBuilder()
                    .setColor(Keys.mainColor)
                    .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                    .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
                    .setDescription(commandsMessage.get(command).description)
                    .addFields(
                        { name: 'Command Usage:', value: '*PREFIX COMMAND ONLY*\n' + commandsMessage.get(command).usage + `\n\n**Aliases:**\n \`${commandsMessage.get(command).aliases.join(', ')}\``, inline: true }
                    )
            } else {
                helpEmbed = new EmbedBuilder()
                    .setColor(Keys.mainColor)
                    .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                    .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
                    .setDescription(commandsMessage.get(command).description)
                    .addFields(
                        { name: 'Command Usage:', value: commandsMessage.get(command).usage + `\n\n**Aliases:**\n \`${commandsMessage.get(command).aliases.join(', ')}\``, inline: true },
                        { name: 'Slash Command Usage:', value: commandsSlash.get(command).usage, inline: true }
                    )
            }
            return message.channel.send({ embeds: [helpEmbed] });
        } else {
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
            return message.channel.send({ embeds: [helpEmbed] });
        }

    }
}