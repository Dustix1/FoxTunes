import { Player, Track } from "magmastream";

export const event = {
    name: 'queueEnd',
    manager: true,
    async execute(player: Player, track: Track) {
        setTimeout(() => {
            if (!player.queue.current) {
                player.disconnect();
                return player.destroy();
            }
        }, 60000);
    }
}