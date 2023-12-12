import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, Colors, EmbedBuilder } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import { createPlayer, player } from "../../structures/player.js";
import logMessage from "../../utils/logMessage.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/play\nAvailable Arguments: song_name/song_url\`\`',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption((option) => option.setName('song').setDescription('The song to play.').setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString('song')!;
        let member = interaction.member as GuildMember;
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!member.voice.channel) {
            embed.setColor(Colors.Red);
            embed.setDescription("You must be in a voice channel to use this command!");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const botCurrentVoiceChannelId = interaction.guild?.members.me?.voice.channelId;

        if (botCurrentVoiceChannelId && member.voice.channelId && member.voice.channelId !== botCurrentVoiceChannelId) {
            embed.setColor(Colors.Red);
            embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply().then(async () => {
            if (!(client.manager.players.get(interaction.guild!.id))) createPlayer(interaction);

            let player = client.manager.players.get(interaction.guild!.id);
            const res = await player!.search(query, interaction.user);

            logMessage(res.loadType, true);

            switch (res.loadType) {
                case "empty":
                    if (!player!.queue.current) player!.destroy();

                    embed.setColor(Colors.Red);
                    embed.setDescription(`Nothing found when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "error":
                    if (!player!.queue.current) player!.destroy();

                    embed.setColor(Colors.Red);
                    embed.setDescription(`Load failed when searching for \`${query}\``);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "track":
                    player!.queue.add(res.tracks[0]);

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && !player!.queue.length) {
                        await player!.play();
                    }
                    break;

                case "playlist":
                    if (!res.playlist?.tracks) return;

                    if (player!.state !== 'CONNECTED') await player!.connect();

                    player!.queue.add(res.playlist.tracks);

                    embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${query}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;

                case "search":
                    if (player!.state !== 'CONNECTED') await player!.connect();

                    player!.queue.add(res.tracks[0]);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) by \`${res.tracks[0].author}\` to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\``);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && !player!.queue.length) {
                        await player!.play();
                    }
                    break;
            }
        });
    }
}