import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, Message } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import { Player } from "magmastream";
import millisecondsToTime from "../../utils/msToTime.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";

const songsPerPage = 4;
let page: number;

async function addEmbendFields(player: Player, embed: EmbedBuilder, page: number, previousButton: ButtonBuilder, nextButton: ButtonBuilder) {
    page == 1 ? previousButton.setDisabled(true) : previousButton.setDisabled(false);
    page == Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage) ? nextButton.setDisabled(true) : nextButton.setDisabled(false);

    embed.setFields([]);
    let fields: { name: string, value: string, inline: boolean }[] = [];
    fields.push({ name: 'Now Playing', value: `[${player!.queue.current?.title.replace(/[\p{Emoji}]/gu, '')}](${player!.queue.current!.uri})\nDuration: ${millisecondsToTime(player!.queue.current?.duration!)}`, inline: false });

    player?.queue.slice(page == 1 ? 0 : (page * songsPerPage) - songsPerPage, page == 1 ? songsPerPage : ((page * songsPerPage) - songsPerPage) + songsPerPage).forEach((track, index) => {
        fields.push({ name: `${page == 1 ? (index + 1) : (((page * songsPerPage) - songsPerPage) + index) + 1 }. ${track.title.replace(/[\p{Emoji}]/gu, '')}`, value: `[LINK](${track.uri})\nDuration: ${millisecondsToTime(track.duration!)}`, inline: false });
    });
    embed.setFooter({ text: `Page ${page} of ${Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage)}` });
    embed.addFields(fields!);
}

async function waitForButton(myMessage: Message, player: Player, queueEmbed: EmbedBuilder, previousButton: ButtonBuilder, nextButton: ButtonBuilder) {
    try {
        let buttonInt = (await myMessage).awaitMessageComponent({ time: 90000 });
        (await buttonInt).customId == 'next' ? page++ : page--;
        await addEmbendFields(player, queueEmbed, page, previousButton, nextButton).then (async () => {
            (await buttonInt).update({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] });
            waitForButton(myMessage, player, queueEmbed, previousButton, nextButton);
        });
    } catch (err) {
        nextButton.setDisabled(true);
        previousButton.setDisabled(true);
        queueEmbed.setFooter({ text: 'This message is inactive.' });
        (await myMessage).edit({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] });
    }
}

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/queue\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Lists the queue.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        if (!player) return interaction.reply({ content: 'there is nothing playing in this guild!' });
        if (!(interaction.member! as GuildMember).voice.channel) return interaction.reply({ content: 'you must be in a voice channel to use this command!' });
        if ((interaction.member! as GuildMember).voice.channel != interaction.guild?.members.me?.voice.channel) return interaction.reply({ content: 'you must be in the same voice channel as me to use this command!' });
        if (!player.queue.current) return interaction.reply({ content: 'there is nothing playing in this guild!' });

        let previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('<')
            .setStyle(ButtonStyle.Secondary);

        let nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary);

        let queueEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setAuthor({ name: 'FoxTunes', iconURL: client.user?.displayAvatarURL() })
            .setTitle('Queue')

        page = 1;
        addEmbendFields(player, queueEmbed, page, previousButton, nextButton);
        interaction.reply({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] }).then((msg) => {
            msg.fetch().then((myMessage) => {
                waitForButton(myMessage, player!, queueEmbed, previousButton, nextButton);
            });
        });
    }
}