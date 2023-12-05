import { Player, Track } from "magmastream";
import logMessage from "../../utils/logMessage.js";

export const event = {
    name: 'queueEnd',
    manager: true,
    async execute(player: Player, track: Track) {
        
        setTimeout(() => {
            if (!player.queue.current) {
                player.disconnect();
                return player.destroy();
            }
        }, 300000);
    }
}