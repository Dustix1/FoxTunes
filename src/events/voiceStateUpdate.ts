import { Events, VoiceState } from 'discord.js';
import client from '../clientLogin.js';
import logMessage from '../utils/logMessage.js';

export const event = {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        if (oldState.member != await client.guilds.fetch(oldState.guild.id).then(guild => guild.members.me)) return;

        let player = client.manager.players.get(oldState.guild!.id);

        if (!newState.channelId) {
            logMessage(`Left voice channel in ${oldState.guild!.name}!`, true);
            player?.destroy();
        } else if (player){
            player!.voiceChannel = newState.channel!.id;
        }
    }
}