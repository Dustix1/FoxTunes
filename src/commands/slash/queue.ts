import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, Message, APIEmbedField } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import { Player } from "magmastream";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import prettyMilliseconds from "pretty-ms";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";

const songsPerPage = 10;
let page: number;

async function addEmbendFields(player: Player, embed: EmbedBuilder, page: number, previousButton: ButtonBuilder, nextButton: ButtonBuilder, firstButton: ButtonBuilder, lastButton: ButtonBuilder) {
    if(page == 1) {
        previousButton.setDisabled(true);
        firstButton.setDisabled(true);
    } else {
        previousButton.setDisabled(false);
        firstButton.setDisabled(false);
    }

    if ( page == Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage)) {
        nextButton.setDisabled(true)
        lastButton.setDisabled(true);
    } else {
        nextButton.setDisabled(false);
        lastButton.setDisabled(false);
    }

    embed.setFields([]);
    let fields: APIEmbedField[] = [];

    let songs = `**<:note:1180261330251415674> Now Playing**\n\`${player.queue.current!.author}\` - [${player.queue.current!.title.replace(/[\p{Emoji}]/gu, '')}](${player!.queue.current!.uri}) - \`${prettyMilliseconds(player!.queue.current?.duration!, { colonNotation: true, secondsDecimalDigits: 0 })}\`\n\n`;
    if (player.queue.size != 0) songs += `**<:queue:1180256450560405555> Songs in Queue [${player.queue.size}]**\n`;
    player?.queue.slice(page == 1 ? 0 : (page * songsPerPage) - songsPerPage, page == 1 ? songsPerPage : ((page * songsPerPage) - songsPerPage) + songsPerPage).forEach((track, index) => {
        songs += `**${page == 1 ? (index + 1) : (((page * songsPerPage) - songsPerPage) + index) + 1}.** - \`${track.author}\` - [${track.title.replace(/[\p{Emoji}]/gu, '')}](${track.uri}) - \`${prettyMilliseconds(track.duration!, { colonNotation: true, secondsDecimalDigits: 0 })}\`\n`;
    });
    embed.setDescription(songs);
    fields.push({ name: 'Playlist duration', value: `\`${prettyMilliseconds(player!.queue.duration, { verbose: true, secondsDecimalDigits: 0 })}\``, inline: false });

    embed.setFooter({ text: `Page ${page} of ${Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage)}` });
    embed.addFields(fields!);
}

async function waitForButton(myMessage: Message, player: Player, queueEmbed: EmbedBuilder, previousButton: ButtonBuilder, nextButton: ButtonBuilder, firstButton: ButtonBuilder, lastButton: ButtonBuilder) {
    try {
        let buttonInt = (await myMessage).awaitMessageComponent({ time: 90000 });
        switch ((await buttonInt).customId) {
            case 'next':
                page++;
                break;
            case 'previous':
                page--;
                break;
            case 'first':
                page = 1;
                break;
            case 'last':
                page = Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage);
                break;
        }
        await addEmbendFields(player, queueEmbed, page, previousButton, nextButton, firstButton, lastButton).then(async () => {
            (await buttonInt).update({ embeds: [queueEmbed], components: [{ type: 1, components: [firstButton, previousButton, nextButton, lastButton] }] });
            waitForButton(myMessage, player, queueEmbed, previousButton, nextButton, firstButton, lastButton);
        });
    } catch (err) {
        previousButton.setDisabled(true);
        nextButton.setDisabled(true);
        previousButton.setDisabled(true);
        nextButton.setDisabled(true);
        queueEmbed.setFooter({ text: 'This message is inactive.' });
        (await myMessage).edit({ embeds: [queueEmbed], components: [{ type: 1, components: [firstButton, previousButton, nextButton, lastButton] }] });
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
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)

        if (!canUserUseSlashCommand(player, interaction, embed)) return;

        let previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('<')
            .setStyle(ButtonStyle.Secondary);

        let nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary);

        let lastButton = new ButtonBuilder()
            .setCustomId('last')
            .setLabel('>>')
            .setStyle(ButtonStyle.Secondary);

        let firstButton = new ButtonBuilder()
            .setCustomId('first')
            .setLabel('<<')
            .setStyle(ButtonStyle.Secondary);

        let queueEmbed = new EmbedBuilder()
            .setColor(Keys.mainColor)
            .setTitle(`Queue for ${interaction.guild?.name} (${player!.queue.size} songs)`)

        page = 1;
        addEmbendFields(player!, queueEmbed, page, previousButton, nextButton, firstButton, lastButton);
        let myMessage;
        if (Math.ceil(player!.queue.size == 0 ? 1 : player!.queue.size / songsPerPage) == 1) {
            interaction.reply({ embeds: [queueEmbed] })
        } else {
            interaction.reply({ embeds: [queueEmbed], components: [{ type: 1, components: [firstButton, previousButton, nextButton, lastButton] }] }).then((msg) => {
                msg.fetch().then((myMessage) => {
                    waitForButton(myMessage, player!, queueEmbed, previousButton, nextButton, firstButton, lastButton);
                });
            });
        }
    }
}