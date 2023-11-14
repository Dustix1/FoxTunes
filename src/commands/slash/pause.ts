import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/pause\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the currently playing song.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        if (!player) return interaction.reply({ content: 'there is nothing playing in this guild!' });
        if (!(interaction.member! as GuildMember).voice.channel) return interaction.reply({ content: 'you must be in a voice channel to use this command!' });
        if ((interaction.member! as GuildMember).voice.channel != interaction.guild?.members.me?.voice.channel) return interaction.reply({ content: 'you must be in the same voice channel as me to use this command!' });
        if (!player.queue.current) return interaction.reply({ content: 'there is nothing playing in this guild!' });

        if (!player.playing) return interaction.reply({ content: 'The song is already paused!' });

        player.pause(true);
        interaction.reply({ content: 'Pausing song... :pause_button:' });
    }
}