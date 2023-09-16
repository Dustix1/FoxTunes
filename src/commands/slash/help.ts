import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { commandsMessage, commandsSlash } from "../../utils/commands.js";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const command = {
    slash: true,
    usage: '\`\`/ping\nAvailable Arguments: command_name\`\`',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands or info about a specific command.')
        .addStringOption(option =>
            option.setName('command')
            .setDescription('command name')
        ),
    async execute(interaction: any) {
        if(!interaction.options.getString('command')) {
            let commandsM = '';
            let commandsS = '';
            commandsMessage.forEach(command => {
                commandsM += `\`!${command.name}\` - ${command.description}\n`;
            });

            commandsSlash.forEach(command => {
                commandsS += `\`/${command.data.name}\` - ${command.data.description}\n`;
            });

            let helpEmbed = new EmbedBuilder()
                .setColor('#9614d0')
                .setAuthor({ name: '[PH BOT NAME]', iconURL: 'https://i.ibb.co/mNzxfp4/Piech-Universal.jpg' })
                .setTitle('Commands')
                .addFields( 
                    { name: 'Message Commands:', value: commandsM },
                    { name: 'Slash Commands:', value: commandsS }
                )

            return interaction.reply({ embeds: [helpEmbed] });
        }
        
        let command = interaction.options.getString('command').toLowerCase(); 
        if(!commandsMessage.has(command)) return interaction.reply({ content: 'Command not found!', ephemeral: true });;

        let helpEmbed = new EmbedBuilder()
            .setColor('#9614d0')
            .setAuthor({ name: '[PH BOT NAME]', iconURL: 'https://i.ibb.co/mNzxfp4/Piech-Universal.jpg' })
            .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
            .setDescription(commandsMessage.get(command).description)
            .addFields(
                { name: 'Command Usage:', value: commandsMessage.get(command).usage, inline: true },
                { name: 'Slash Command Usage:', value: commandsSlash.get(command).usage, inline: true }
            )

        interaction.reply({ embeds: [helpEmbed] });
    }
}