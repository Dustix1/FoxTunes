import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";
import { ActivityType, Colors, EmbedBuilder, PresenceUpdateStatus, TextBasedChannel } from "discord.js";
import client from "../../clientLogin.js";
import { lavalinkConnectionStatus } from "../../lavalinkLogin.js";
import logMessage from "../../utils/logMessage.js";

export const event = {
    name: 'nodeError',
    manager: true,
    async execute(error: any) {
        lavalinkConnectionStatus.isLavalinkConnected = false;
        spinnerLavalinkLogin.fail(chalk.red.bold(`Lavalink connection failed! --> Attempting to reconnect...`));

        if (lavalinkConnectionStatus.isStandby === false) {
            logMessage('SETTING STANDBY', true);

            client.guilds.cache.forEach(guild => {
                let player = client.manager.players.get(guild.id);
                if (player) {
                    let embed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`:warning: The bot is experiencing technical difficulties and will be offline for a while. Please be patient.`)
                    
                    guild.channels.fetch(player.textChannel!).then(channel => {
                        (channel as TextBasedChannel).send({ embeds: [embed] });
                    });
                    player?.disconnect();
                    player?.destroy();
                }
            });

            client.user?.setPresence({
                activities: [{ name: 'Standby mode', type: ActivityType.Custom }], // ▷▶NEW UPDATE◀◁
                status: PresenceUpdateStatus.DoNotDisturb,
            })
            lavalinkConnectionStatus.isStandby = true;
        }
    }
}