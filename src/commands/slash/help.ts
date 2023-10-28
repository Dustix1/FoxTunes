import { SlashCommandBuilder, EmbedBuilder, Interaction, ChatInputCommandInteraction } from "discord.js";
import { commandsMessage, commandsSlash } from "../../utils/commands.js";
import { Keys } from "../../keys.js";
import client from "../../clientLogin.js";
import { CommandSlash } from "../../structures/command.js";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/ping\nAvailable Arguments: command_name\`\`',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands or info about a specific command.')
        .addStringOption(option =>
            option.setName('command')
            .setDescription('command name')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.options.getString('command')) {
            let commandsM = '';
            let commandsS = '';
            commandsMessage.forEach(command => {
                if(!command.hidden) {
                    commandsM += `\`!${command.name}\` - ${command.description}\n`;
                }
            });

            commandsSlash.forEach(command => {
                if (!command.hidden) {
                    commandsS += `\`/${command.data.name}\` - ${command.data.description}\n`;
                }
            });

            let helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle('Commands')
                .addFields( 
                    { name: 'Message Commands:', value: commandsM },
                    { name: 'Slash Commands:', value: commandsS }
                )

            return interaction.reply({ embeds: [helpEmbed] });
        }

        
        let command = interaction.options.getString('command')?.toLowerCase(); 
        if(!commandsMessage.has(command)) return interaction.reply({ content: 'Command not found!', ephemeral: true });

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

        interaction.reply({ embeds: [helpEmbed] });
    }
}