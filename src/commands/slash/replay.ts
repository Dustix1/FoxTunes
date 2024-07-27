import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors, GuildMember, User, ClientUser } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { guildSongPreviousCache } from "../../events/lavalink/trackStart.js";
import { createPlayer } from "../../structures/player.js";
import logMessage from "../../utils/logMessage.js";
import playSong from "../../utils/playSong.js";

export const command: CommandSlash = {
    slash: true,
    group: 'musicPlayback',
    usage: '\`\`/replay\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('replay')
        .setDescription('Replays the last played song.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let member = interaction.member as GuildMember;
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!member.voice.channel) {
            embed.setColor(Colors.Red);
            embed.setDescription("You must be in a voice channel to use this command!");
            return interaction.reply({ embeds: [embed] });
        }

        let guildCache = guildSongPreviousCache.get(interaction.guild!.id);
        if (guildCache === undefined) {
            embed.setColor(Colors.Blurple);
            embed.setDescription('There is no song to replay!');
            return interaction.reply({ embeds: [embed] });
        }

        if (player) {
            const botCurrentVoiceChannelId = interaction.guild?.members.me?.voice.channelId;
            if (botCurrentVoiceChannelId && member.voice.channelId && member.voice.channelId !== botCurrentVoiceChannelId) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
                return await interaction.reply({ embeds: [embed] });
            }
        } else {
            createPlayer(interaction);
            player = client.manager.players.get(interaction.guild!.id);
            player!.connect();
        }

        await interaction.deferReply().then(async () => {
            player = client.manager.players.get(interaction.guild!.id);

            const res = await player!.search(guildCache!, interaction.user as any);

            logMessage(res.loadType, true);

            playSong(res, player!, embed, undefined, undefined, interaction);
        });
    }
}