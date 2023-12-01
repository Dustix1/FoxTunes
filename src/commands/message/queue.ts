import { APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { CommandMessage } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { Player } from "magmastream";
import prettyMilliseconds from "pretty-ms";
import canUserUseCommand from "../../utils/checkIfUserCanUseCommand.js";

const songsPerPage = 10;
let page: number;

async function addEmbendFields(player: Player, embed: EmbedBuilder, page: number, previousButton: ButtonBuilder, nextButton: ButtonBuilder) {
    page == 1 ? previousButton.setDisabled(true) : previousButton.setDisabled(false);
    page == Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage) ? nextButton.setDisabled(true) : nextButton.setDisabled(false);

    embed.setFields([]);
    let fields: APIEmbedField[] = [];

    let songs = `**<:note:1180261330251415674> Now Playing**\n\`${player.queue.current!.author}\` - [${player.queue.current!.title.replace(/[\p{Emoji}]/gu, '')}](${player!.queue.current!.uri}) - \`${prettyMilliseconds(player!.queue.current?.duration!, { colonNotation: true })}\`\n\n`;
    if (player.queue.size != 0) songs += `**<:queue:1180256450560405555> Songs in Queue [${player.queue.size}]**\n`;
    player?.queue.slice(page == 1 ? 0 : (page * songsPerPage) - songsPerPage, page == 1 ? songsPerPage : ((page * songsPerPage) - songsPerPage) + songsPerPage).forEach((track, index) => {
        songs += `**${page == 1 ? (index + 1) : (((page * songsPerPage) - songsPerPage) + index) + 1}.** - \`${track.author}\` - [${track.title.replace(/[\p{Emoji}]/gu, '')}](${track.uri}) - \`${prettyMilliseconds(track.duration!, { colonNotation: true })}\`\n`;
    });
    embed.setDescription(songs);
    fields.push({ name: 'Playlist duration', value: `\`${prettyMilliseconds(player!.queue.duration, { verbose: true, secondsDecimalDigits: 0 })}\``, inline: false });

    embed.setFooter({ text: `Page ${page} of ${Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage)}` });
    embed.addFields(fields!);
}

async function waitForButton(myMessage: Promise<Message>, message: Message, player: Player, queueEmbed: EmbedBuilder, previousButton: ButtonBuilder, nextButton: ButtonBuilder) {
    try {
        let buttonInt = (await myMessage).awaitMessageComponent({ time: 90000 });
        (await buttonInt).customId == 'next' ? page++ : page--;
        await addEmbendFields(player, queueEmbed, page, previousButton, nextButton).then(async () => {
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
    aliases: ['q'],
    usage: '\`\`!queue\nNo available Arguments.\`\`',
    description: 'Lists the queue.',
    async execute(message: Message, args: any) {
        let player = client.manager.players.get(message.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseCommand(player, message, embed)) return;

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
            .setTitle(`${message.guild?.name} Playlist`)

        page = 1;
        addEmbendFields(player!, queueEmbed, page, previousButton, nextButton);
        let myMessage = message.channel.send({ embeds: [queueEmbed], components: [{ type: 1, components: [previousButton, nextButton] }] });
        waitForButton(myMessage, message, player!, queueEmbed, previousButton, nextButton);
    }
}