import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { CommandSlash } from "../../structures/command.js";
import client from "../../clientLogin.js";
import Keys from "../../keys.js";
import { canUserUseSlashCommand } from "../../utils/checkIfUserCanUseCommand.js";
import Genius from "genius-lyrics";

export const command: CommandSlash = {
    slash: true,
    usage: '\`\`/lyrics\nNo available Arguments.\`\`',
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Finds the lyrics of the currently playing song.'),
    async execute(interaction: ChatInputCommandInteraction) {
        let player = client.manager.players.get(interaction.guild!.id);
        let embed = new EmbedBuilder()
            .setColor(Keys.mainColor)
        if (!canUserUseSlashCommand(player, interaction, embed)) return;
        const Client = new Genius.Client();

        await interaction.deferReply().then(async () => {
            embed.setColor(Colors.Blurple)
            .setDescription('searching for lyrics...\nThis may take a while.');
            interaction.editReply({ embeds: [embed] });

            const search = await Client.songs.search(player!.queue.current!.title);
            if (search.length == 0) {
                embed.setColor(Colors.Red);
                embed.setDescription(`Couldn't find lyrics for \`${player!.queue.current!.title}\``);
                return interaction.editReply({ embeds: [embed] });
            }
            const lyrics = await search[0].lyrics();
            embed.setDescription(lyrics);
            if (!lyrics) {
                embed.setDescription(`Couldn't find lyrics for \`${player!.queue.current!.title}\``);
                embed.setColor(Colors.Red);
            }
            embed.setColor(Keys.mainColor)
            .setAuthor({ name: 'Please note that this may not be accurate.', iconURL: client.user?.displayAvatarURL() })
            .setTitle('Lyrics for ' + player!.queue.current!.title)
            .setThumbnail(player!.queue.current!.thumbnail!)
            .setFooter({ text: 'Lyrics from: https://genius.com/' });
            interaction.editReply({ embeds: [embed] });
        });
    }
}