import { Events, VoiceState } from 'discord.js';
import client from '../clientLogin.js';

export const event = {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        if (oldState.member != await client.guilds.fetch(oldState.guild.id).then(guild => guild.members.me)) return;

        let player = client.manager.players.get(oldState.guild!.id);

        if (!newState.channelId) {
            player?.destroy();
        } else if (player){
            player!.voiceChannel = newState.channel!.id;
        }
    }
}