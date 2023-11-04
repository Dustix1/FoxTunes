import { ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { Player } from "magmastream";

const songsPerPage = 4;
let page: number;

function millisecondsToTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function addEmbendFields(player: Player, embed: EmbedBuilder, page: number, previousButton: ButtonBuilder, nextButton: ButtonBuilder) {
    page == 1 ? previousButton.setDisabled(true) : previousButton.setDisabled(false);
    page == Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage) ? nextButton.setDisabled(true) : nextButton.setDisabled(false);

    embed.setFields([]);
    let fields: { name: string, value: string, inline: boolean }[] = [];
    fields.push({ name: 'Now Playing', value: `[${player!.queue.current?.title.replace(/[^\x20-\x7E]/g, '')}](${player!.queue.current!.uri})\nDuration: ${millisecondsToTime(player!.queue.current?.duration!)}`, inline: false });

    player?.queue.slice(page == 1 ? 0 : (page * songsPerPage) - songsPerPage, page == 1 ? songsPerPage : ((page * songsPerPage) - songsPerPage) + songsPerPage).forEach((track, index) => {
        fields.push({ name: `${page == 1 ? (index + 1) : (((page * songsPerPage) - songsPerPage) + index) + 1 }. [${track.title.replace(/[^\x20-\x7E]/g, '')}](${track.uri})`, value: `Duration: ${millisecondsToTime(track.duration!)} `, inline: false });
    });
    embed.setFooter({ text: `Page ${page} of ${Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage)}` });
    embed.addFields(fields!);
}

async function waitForButton(myMessage: Promise<Message>, message: Message, player: Player, queueEmbed: EmbedBuilder, previousButton: ButtonBuilder, nextButton: ButtonBuilder) {
    try {
        let buttonInt = (await myMessage).awaitMessageComponent({ filter: (interaction) => interaction.user.id == message.author.id, time: 90000 });
        (await buttonInt).customId == 'next' ? page++ : page--;
        await addEmbendFields(player, queueEmbed, page, previousButton, nextButton).then (async () => {
            (await buttonInt).update({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] });
            waitForButton(myMessage, message, player, queueEmbed, previousButton, nextButton);
        });
    } catch (err) {
        nextButton.setDisabled(true);
        previousButton.setDisabled(true);
        queueEmbed.setFooter({ text: 'This message is inactive.' });
        (await myMessage).edit({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] });
    }
}

export const command: CommandMessage = {
    slash: false,
    name: 'queue',
    usage: '\`\`!queue\nAvailable arguments: page\`\`',
    description: 'Lists the queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        if (!player) return message.reply({ content: 'there is nothing playing in this guild!' });
        if (!message.member?.voice.channel) return message.reply({ content: 'you must be in a voice channel to use this command!' });
        if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) return message.reply({ content: 'you must be in the same voice channel as me to use this command!' });
        if (!player.queue.current) return message.reply({ content: 'there is nothing playing in this guild!' });

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
        let myMessage = message.channel.send({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] });
        waitForButton(myMessage, message, player, queueEmbed, previousButton, nextButton);
    }
}