import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import { createPlayer, player } from "../../structures/player.js";
import logMessage from "../../utils/logMessage.js";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/play\nAvailable Arguments: song_name/song_url\`\`',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song.')
        .addStringOption((option) => option.setName('song').setDescription('The song to play.').setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString('song')!;
        let member = interaction.member as GuildMember;
        if (!member.voice.channel) return interaction.reply({ content: 'you must be in a voice channel to use this command!', ephemeral: true });

        const botCurrentVoiceChannelId = interaction.guild?.members.me?.voice.channelId;

        if (botCurrentVoiceChannelId && member.voice.channelId && member.voice.channelId !== botCurrentVoiceChannelId) {
            return await interaction.reply({ content: `You must be connnected to the same voice channel as me to use this command. I'm in <#${botCurrentVoiceChannelId}>`, ephemeral: true });
        }

        if (!(client.manager.players.get(interaction.guild!.id))) createPlayer(interaction);

        const res = await player.search(query, interaction.user);

        logMessage(res.loadType, true);

        switch (res.loadType) {
            case "empty":
                if (!player.queue.current) player.destroy();

                return await interaction.reply({ content: `Nothing found when searching for \`${query}\``, ephemeral: true });

            case "error":
                if (!player.queue.current) player.destroy();

                return await interaction.reply({ content: `Load failed when searching for \`${query}\``, ephemeral: true });

            case "track":
                player.queue.add(res.tracks[0]);

                if (player.state !== 'CONNECTED') await player.connect();

                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }

                if (player.queue.length != 0) {
                    interaction.reply({ content: `Added [${res.tracks[0].title.replace(/[^\x20-\x7E]/g, '')}](${res.tracks[0].uri}) to the queue.`, }).then((msg) => {
                        setTimeout(() => {
                            return msg.fetch().then((myMessage) => {
                                myMessage.suppressEmbeds();
                            });
                        }, 2000);
                    });
                } else {
                    interaction.reply({ content: `Searching...` });
                }

            case "playlist":
                if (!res.playlist?.tracks) return;

                if (player.state !== 'CONNECTED') await player.connect();

                player.queue.add(res.playlist.tracks);

                if (
                    !player.playing &&
                    !player.paused &&
                    player.queue.size === res.playlist.tracks.length
                ) {
                    await player.play();
                }

                if (player.queue.length != 0) {
                    interaction.reply({ content: `Added [${res.playlist.name.replace(/[^\x20-\x7E]/g, '')}](${query}) playlist to the queue.`, }).then((msg) => {
                        setTimeout(() => {
                            return msg.fetch().then((myMessage) => {
                                myMessage.suppressEmbeds();
                            });
                        }, 2000);
                    });
                } else {
                    interaction.reply({ content: `Searching...` });
                }

            case "search":
                if (player.state !== 'CONNECTED') await player.connect();

                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused && !player.queue.length) {
                    await player.play();
                }

                if (player.queue.length != 0) {
                    interaction.reply({ content: `Added [${res.tracks[0].title.replace(/[^\x20-\x7E]/g, '')}](${res.tracks[0].uri}) to the queue.`, }).then((msg) => {
                        setTimeout(() => {
                            return msg.fetch().then((myMessage) => {
                                myMessage.suppressEmbeds();
                            });
                        }, 2000);
                    });
                } else {
                    interaction.reply({ content: `Searching...` });
                }
        }
    }
}