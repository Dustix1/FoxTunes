import { ChatInputCommandInteraction, GuildMember, Message } from "discord.js";
import client from "../clientLogin.js";
import { Player } from "magmastream";

export let player: Player;

export const createPlayer = (message: Message | ChatInputCommandInteraction) => {
    let member = message.member as GuildMember;
    player = client.manager.create({
        guild: message.guild!.id,
        voiceChannel: member.voice.channel!.id,
        textChannel: message.channel!.id,
        selfDeafen: true,
        volume: 20,
    });
}