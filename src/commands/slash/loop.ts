import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/loop\nAvailable arguments: queue\`\`',
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops the current song/queue.')
        .addStringOption(option =>
            option
                .setName('queue')
                .setDescription('loop the queue.')
                .setRequired(false)
                .addChoices({ name: 'queue', value: 'queue' } as const)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        if (!player) return interaction.reply({ content: 'there is nothing playing in this guild!' });
        if (!(interaction.member! as GuildMember).voice.channel) return interaction.reply({ content: 'you must be in a voice channel to use this command!' });
        if ((interaction.member! as GuildMember).voice.channel != interaction.guild?.members.me?.voice.channel) return interaction.reply({ content: 'you must be in the same voice channel as me to use this command!' });
        if (!player.queue.current) return interaction.reply({ content: 'there is nothing playing in this guild!' });

        if (!interaction.options.getString('queue')) {
            player.setTrackRepeat(!player.trackRepeat);
            interaction.reply({ content: `Looping ${player.trackRepeat ? 'enabled' : 'disabled'}!` });
        } else {
            player.setQueueRepeat(!player.queueRepeat);
            interaction.reply({ content: `Queue Looping ${player.queueRepeat ? 'enabled' : 'disabled'}!` });
        }
    }
}