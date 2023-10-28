import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/skip\nAvailable arguments: number_of_songs_to_skip\`\`',
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips a song or multiple songs.')
        .addStringOption(option =>
            option.setName('skipnumber')
                .setDescription('how many songs to skip.')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        if (!player) return interaction.reply({ content: 'there is nothing playing in this guild!' });
        if (!(interaction.member! as GuildMember).voice.channel) return interaction.reply({ content: 'you must be in a voice channel to use this command!' });
        if ((interaction.member! as GuildMember).voice.channel != interaction.guild?.members.me?.voice.channel) return interaction.reply({ content: 'you must be in the same voice channel as me to use this command!' });
        if (!player.queue.current) return interaction.reply({ content: 'there is nothing playing in this guild!' });

        if (!interaction.options.getString('skipnumber')) {
            player.stop();
            interaction.reply({ content: 'Skipping song...' });
        } else {
            let skipNumber = parseInt(interaction.options.getString('skipnumber')!);
            if (isNaN(skipNumber)) return interaction.reply({ content: 'Please provide a number.', ephemeral: true });
            skipNumber = Math.abs(skipNumber);

            if (skipNumber > player.queue.length) {
                skipNumber = player.queue.length + 1;
                player.queue.clear();
                player.stop();
            } else {
                player.stop(skipNumber);
            }
            interaction.reply({ content: `Skipping ${skipNumber} songs...` });
        }
    }
}