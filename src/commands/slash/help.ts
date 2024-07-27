import { SlashCommandBuilder, EmbedBuilder, Interaction, ChatInputCommandInteraction, Colors } from "discord.js";
import { commandsMessage, commandsSlash } from "../../utils/commands.js";
import { Keys } from "../../keys.js";
import client from "../../clientLogin.js";
import { CommandSlash } from "../../structures/command.js";
import logMessage from "../../utils/logMessage.js";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const command: CommandSlash = {
    slash: true,
    group: 'general',
    usage: '\`\`/help\nAvailable Arguments: command_name\`\`',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands or info about a specific command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('command name')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let allCommands = commandsSlash;
        commandsMessage.forEach((command, key) => {
            if (!command.hidden && !allCommands.has(key)) {
                allCommands.set(key, command);
            }
        });

        if (!interaction.options.getString('command')) {
            let commandsM = 'You can use !help <command_name> to get info about a specific command.\n\n';
            let generalCommands = '**General Commands:**\n';
            let musicPlaybackCommands = '**Music Playback Commands:**\n';
            let queueMgmtCommands = '**Queue Management Commands:**\n';
            let supportCommands = '**Support Commands:**\n';

            allCommands.forEach(command => {
                switch (command.group) {
                    case 'general':
                        if (!command.slash) {
                            generalCommands += `\`${command.name}\` - ${command.description}\n`;
                        } else {
                            generalCommands += `\`${(command.data as SlashCommandBuilder).name}\` - ${(command.data as SlashCommandBuilder).description}\n`;
                        }

                        break;
                    case 'musicPlayback':
                        if (!command.slash) {
                            musicPlaybackCommands += `\`${command.name}\` - ${command.description}\n`;
                        } else {
                            musicPlaybackCommands += `\`${(command.data as SlashCommandBuilder).name}\` - ${(command.data as SlashCommandBuilder).description}\n`;
                        }
                        break;
                    case 'queueMgmt':
                        if (!command.slash) {
                            queueMgmtCommands += `\`${command.name}\` - ${command.description}\n`;
                        } else {
                            queueMgmtCommands += `\`${(command.data as SlashCommandBuilder).name}\` - ${(command.data as SlashCommandBuilder).description}\n`;
                        }
                        break;
                    case 'support':
                        if (!command.slash) {
                            supportCommands += `\`${command.name}\` - ${command.description}\n`;
                        } else {
                            supportCommands += `\`${(command.data as SlashCommandBuilder).name}\` - ${(command.data as SlashCommandBuilder).description}\n`;
                        }
                }
            })
            commandsM += generalCommands + '\n' + supportCommands + '\n' + musicPlaybackCommands + '\n' + queueMgmtCommands;

            let helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle('Commands')
                .setDescription(commandsM)

            return interaction.reply({ embeds: [helpEmbed] });
        }


        let command = interaction.options.getString('command')?.toLowerCase();
        if (!allCommands.has(command)) {
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
                return interaction.reply({ embeds: [embed] });
            }
        }

        let helpEmbed;
        if (command == 'playlist') {
            helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
                .setDescription(`${commandsMessage.get(command).description}\n*this command cannot be used as a slash command.*\n
                **Command Usage:**
                *you can list what playlists you have with \`!playlist list\`*
                you can play your playlist with \`!play playlist <the name of the playlist>\` or play your liked songs playlist with \`!play liked\`\n
                ***Playlist creation/deletion:***
                \`!playlist create <the name of the playlist>\` - creates a playlist with the specified name
                \`!playlist delete <the name of the playlist>\` - deletes the playlist with the specified name
                \`!playlist delete-all\` - deletes all playlists
                \n***Specific playlist management:***
                you can list all songs in a playlist with \`!playlist <the name of the playlist> list\`
                \n***Adding/removing songs from a playlist:***
                \`!playlist <the name of the playlist> add <the name of the song>\` - adds the song to the playlist
                \`!playlist <the name of the playlist> remove <the name or position of the song>\` - removes the song from the playlist
                \`!playlist <the name of the playlist> clear\` - removes all songs from the playlist
                \n**Aliases:**\n \`${commandsMessage.get(command).aliases.join(', ')}\``)
            return interaction.reply({ embeds: [helpEmbed] });
        } else {
            helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle(capitalizeFirstLetter(allCommands.get(command).data.name))
                .setDescription(allCommands.get(command).data.description)
                .addFields(
                    { name: 'Command Usage:', value: allCommands.get(command).usage, inline: true },
                )

            return interaction.reply({ embeds: [helpEmbed] });
        }
    }
}