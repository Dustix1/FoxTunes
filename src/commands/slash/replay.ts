import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors, GuildMember } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import { guildSongPreviousCache } from "../../events/lavalink/trackStart.js";
import { createPlayer } from "../../structures/player.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandSlash = {
    slash: true,
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

        const botCurrentVoiceChannelId = interaction.guild?.members.me?.voice.channelId;

        if (player) {
            if (botCurrentVoiceChannelId && member.voice.channelId && member.voice.channelId !== botCurrentVoiceChannelId) {
                embed.setColor(Colors.Red);
                embed.setDescription(`You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`);
                return await interaction.reply({ embeds: [embed] });
            }
        } else {
            createPlayer(interaction);
        }

        await interaction.deferReply().then(async () => {
            player = client.manager.players.get(interaction.guild!.id);

            const res = await player!.search(guildCache!, interaction.user);

            logMessage(res.loadType, true);

            switch (res.loadType) {
                case "empty":
                    embed.setColor(Colors.Red);
                    embed.setDescription(`There has been an error with replaying the song!`);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "error":
                    embed.setColor(Colors.Red);
                    embed.setDescription(`There has been an error with replaying the song!`);
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case "track":
                    player!.queue.add(res.tracks[0]);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && !player!.queue.length) {
                        await player!.play();
                    }
                    break;

                case "playlist":
                    if (!res.playlist?.tracks) return;

                    player!.queue.add(res.playlist.tracks);

                    embed.setDescription(`Added [${res.playlist.name.replace(/[\p{Emoji}]/gu, '')}](${guildCache}) with \`${res.playlist.tracks.length}\` tracks to the queue.`);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && player!.queue.size === res.playlist.tracks.length) {
                        await player!.play();
                    }
                    break;

                case "search":
                    player!.queue.add(res.tracks[0]);

                    embed.setDescription(`Added [${res.tracks[0].title.replace(/[\p{Emoji}]/gu, '')}](${res.tracks[0].uri}) to the queue - \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
                    interaction.editReply({ embeds: [embed] });

                    if (!player!.playing && !player!.paused && !player!.queue.length) {
                        await player!.play();
                    }
                    break;
            }
        });
    }
}