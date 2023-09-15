import { EmbedBuilder } from "discord.js";
import { commandsMessage, commandsSlash } from "../../utils/commands.js";

export const command = {
    slash: false,
    name: 'help',
    description: 'List all commands or info about a specific command.',
    async execute(message: any, args: any) {
        if(!args[0]) {
            commandsMessage.forEach(command => {
                
            });

            let helpEmbed = new EmbedBuilder()
                .setColor('#9614d0')
                .setTitle('Commands')
                .addFields( 
                    { name: 'Message Commands:', value:},
                    { name: 'Slash Commands:', value:}
                )
        }
        let command = args[0].toLowerCase(); 
        if(!commandsMessage.has(command)) return;

        let helpEmbed = new EmbedBuilder()
            .setColor('#9614d0')
            .setTitle(commandsMessage.get(command).name)
            .setDescription(commandsMessage.get(command).description)
            .addFields(
                { name: 'Command Usage:', value: commandsMessage.get(command).usage, inline: true },
                { name: 'Slash Command Usage:', value: commandsSlash.get(command).usage, inline: true }
            )

        message.channel.send({ embeds: [helpEmbed] });
            
    }
}