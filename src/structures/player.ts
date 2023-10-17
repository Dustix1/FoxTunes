import { Message } from "discord.js";
import client from "../clientLogin.js";
import { Player } from "magmastream";

export let player: Player;

export const createPlayer = (message: Message) => {
    player = client.manager.create({
        guild: message.guild!.id,
        voiceChannel: message.member!.voice.channel!.id,
        textChannel: message.channel.id,
        selfDeafen: true,
        volume: 20,
    });
}