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
    group: 'general',
    async execute(message: Message, args: any) {
        if (!args[0]) {
            let commandsM = 'You can use !help <command_name> to get info about a specific command.\n\n';
            let generalCommands = '**General Commands:**\n';
            let musicPlaybackCommands = '**Music Playback Commands:**\n';
            let queueMgmtCommands = '**Queue Management Commands:**\n';
            commandsMessage.forEach(command => {
                if (!command.hidden) {
                    switch (command.group) {
                        case 'general':
                            generalCommands += `\`${command.name}\` - ${command.description}\n`;
                            break;
                        case 'musicPlayback':
                            musicPlaybackCommands += `\`${command.name}\` - ${command.description}\n`;
                            break;
                        case 'queueMgmt':
                            queueMgmtCommands += `\`${command.name}\` - ${command.description}\n`;
                            break;
                    }
                }
            });
            commandsM += generalCommands + '\n' + musicPlaybackCommands + '\n' + queueMgmtCommands;

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
        if (commandsMessage.get(command).name == 'playlist') {
            helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
                .setDescription(`${commandsMessage.get(command).description}\n*this command cannot be used as a slash command.*
                **Command Usage:**
                *you can list what playlists you have with \`!playlist list\`*
                you can play your playlist with \`!play playlist <the name of the playlist>\`\n
                ***Playlist creation/deletion:***
                \`!playlist create <the name of the playlist>\` - creates a playlist with the specified name
                \`!playlist delete <the name of the playlist>\` - deletes the playlist with the specified name
                \`!playlist delete-all\` - deletes all playlists
                \n***Specific playlist management:***
                you can list all songs in a playlist with \`!playlist <the name of the playlist> list\`
                \n***Adding/removing songs from a playlist:***
                \`!playlist <the name of the playlist> add <the name of the song>\` - adds the song to the playlist
                \`!playlist <the name of the playlist> remove <the name of the song>\` - removes the song from the playlist
                \`!playlist <the name of the playlist> clear\` - removes all songs from the playlist
                \n**Aliases:**\n \`${commandsMessage.get(command).aliases.join(', ')}\``)
            return message.channel.send({ embeds: [helpEmbed] });
        }

        if (commandsMessage.get(command).aliases) {
            if (!commandsSlash.get(command)) {
                helpEmbed = new EmbedBuilder()
                    .setColor(Keys.mainColor)
                    .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                    .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
                    .setDescription(commandsMessage.get(command).description)
                    .addFields(
                        { name: 'Command Usage:', value: '*this command cannot be used as a slash command.*\n' + commandsMessage.get(command).usage + `\n\n**Aliases:**\n \`${commandsMessage.get(command).aliases.join(', ')}\``, inline: true }
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
                        { name: 'Command Usage:', value: '*this command cannot be used as a slash command.*\n' + commandsMessage.get(command).usage, inline: true }
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