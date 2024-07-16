import { CategoryChannel, ChannelType, Events, GuildMember, TextBasedChannel, TextChannel } from 'discord.js';
import Keys from '../keys.js';

export const event = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        const guild = member.guild;
        if (guild.id !== Keys.foxtunesGuildID) return;

        const category = await guild.channels.fetch('1262502735220178955') as CategoryChannel;

        category.children.cache.forEach(async channel => {
            if (channel.type === ChannelType.GuildText) {
                const textChannel = channel as TextChannel;
                if (textChannel.topic?.split('-')[1] === member.id) {
                    textChannel.permissionOverwrites.edit(member.id, { ViewChannel: true, SendMessages: true });
                    return;
                }
            }
        })
    }
}