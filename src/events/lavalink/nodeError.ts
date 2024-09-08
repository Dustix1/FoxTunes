import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";
import { ActivityType, Colors, EmbedBuilder, PresenceUpdateStatus, TextBasedChannel, TextChannel } from "discord.js";
import client from "../../clientLogin.js";
import { clientConnectionStatus } from "../../clientLogin.js";
import Keys from "../../keys.js";


export const event = {
    name: 'nodeError',
    manager: true,
    async execute(error: Error) {
        clientConnectionStatus.isLavalinkConnected = false;
        let date = new Date();
        spinnerLavalinkLogin.fail(chalk.red.bold(`Lavalink connection failed! --> Attempting to reconnect... ⏳ ${chalk.hex(Keys.mainColor).bold(`[${date.toDateString()}] [${date.toTimeString().split(' ')[0]}]`)} ⏳`));

        if (clientConnectionStatus.isStandby === false) {
            client.guilds.cache.forEach(guild => {
                let player = client.manager.players.get(guild.id);
                if (player) {
                    let embed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`:warning: The bot is currently experiencing technical difficulties or undergoing an update and will be offline for a while. Thank you for your patience.`)
                    
                    guild.channels.fetch(player.textChannel!).then(channel => {
                        (channel as TextChannel).send({ embeds: [embed] });
                    });
                    player?.disconnect();
                    player?.destroy();
                }
            });

            client.user?.setPresence({
                activities: [{ name: 'Standby mode', type: ActivityType.Custom }],
                status: PresenceUpdateStatus.DoNotDisturb,
            })
            clientConnectionStatus.isStandby = true;
        }
    }
}