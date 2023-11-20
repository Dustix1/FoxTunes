import { ChatInputCommandInteraction, Colors, EmbedBuilder, GuildMember, Message } from "discord.js";
import { Player } from "magmastream";

export default function canUserUseCommand(player: Player | undefined, message: Message, embed: EmbedBuilder) {
    if (!player) {
        embed.setColor(Colors.Red);
        embed.setDescription("There is nothing playing in this guild! Play a song by using `/play` or `!play`");
        message.reply({ embeds: [embed] });
        return false;
    }
    if (message.member?.voice.channel != message.guild?.members.me?.voice.channel) {
        embed.setColor(Colors.Red);
        embed.setDescription(`You must be in the same voice channel as me to use this command. I'm in <#${message.guild?.members.me?.voice.channelId}>`);
        message.reply({ embeds: [embed] });
        return false;
    }
    if (!player!.queue.current) {
        embed.setColor(Colors.Red);
        embed.setDescription("There is nothing playing in this guild! Play a song by using `/play` or `!play`");
        message.reply({ embeds: [embed] });
        return false;
    }
    return true;
}

export function canUserUseSlashCommand(player: Player | undefined, interaction: ChatInputCommandInteraction, embed: EmbedBuilder) {
    if (!player) {
        embed.setColor(Colors.Red);
        embed.setDescription("There is nothing playing in this guild! Play a song by using `/play` or `!play`");
        interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }
    if (!(interaction.member! as GuildMember).voice.channel) {
        embed.setColor(Colors.Red);
        embed.setDescription("You must be in a voice channel to use this command!");
        interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }
    if ((interaction.member! as GuildMember).voice.channel != interaction.guild?.members.me?.voice.channel) {
        embed.setColor(Colors.Red);
        embed.setDescription(`You must be in the same voice channel as me to use this command. I'm in <#${interaction.guild?.members.me?.voice.channelId}>`);
        interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }
    if (!player.queue.current) {
        embed.setColor(Colors.Red);
        embed.setDescription("There is nothing playing in this guild! Play a song by using `/play` or `!play`");
        interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }
    return true;
}