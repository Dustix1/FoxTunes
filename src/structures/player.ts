import { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import client from "../clientLogin.js";
import { Player } from "magmastream";

export let player: Player;

export const createPlayer = (message: Message | ChatInputCommandInteraction | number) => {
    if (typeof message === 'number') return client.manager.create({
        guild: '0000000000000000000',
        voiceChannel: '0000000000000000000',
        textChannel: '0000000000000000000',
    });
    
    let member = message.member as GuildMember;
    player = client.manager.create({
        guild: message.guild!.id,
        voiceChannel: member.voice.channel!.id,
        textChannel: message.channel!.id,
        selfDeafen: true,
        volume: 50,
    });
}