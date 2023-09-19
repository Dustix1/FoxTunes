import { EmbedBuilder } from "discord.js";
import { commandsMessage, commandsSlash } from "../../utils/commands.js";
import { Keys } from "../../keys.js";
import client from "../../clientLogin.js";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const command = {
    slash: false,
    name: 'help',
    usage: '\`\`!help\nAvailable Arguments: command_name\`\`',
    description: 'List all commands or info about a specific command.',
    async execute(message: any, args: any) {
        if(!args[0]) {
            let commandsM = '';
            let commandsS = '';
            commandsMessage.forEach(command => {
                commandsM += `\`!${command.name}\` - ${command.description}\n`;
            });

            commandsSlash.forEach(command => {
                commandsS += `\`/${command.data.name}\` - ${command.data.description}\n`;
            });

            let helpEmbed = new EmbedBuilder()
                .setColor(Keys.mainColor)
                .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
                .setTitle('Commands')
                .addFields( 
                    { name: 'Message Commands:', value: commandsM },
                    { name: 'Slash Commands:', value: commandsS }
                )

            return message.channel.send({ embeds: [helpEmbed] });
        }
        
        let command = args[0].toLowerCase(); 
        if(!commandsMessage.has(command)) return message.reply({ content: 'Command not found!', ephemeral: true });

        let helpEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setAuthor({ name: 'FoxTunes', iconURL: 'https://i.ibb.co/mNzxfp4/Piech-Universal.jpg' })
            .setTitle(capitalizeFirstLetter(commandsMessage.get(command).name))
            .setDescription(commandsMessage.get(command).description)
            .addFields(
                { name: 'Command Usage:', value: commandsMessage.get(command).usage, inline: true },
                { name: 'Slash Command Usage:', value: commandsSlash.get(command).usage, inline: true }
            )

        message.channel.send({ embeds: [helpEmbed] });
            
    }
}