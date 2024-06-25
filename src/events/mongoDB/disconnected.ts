import chalk from "chalk";
import { spinnerMongodbLogin } from "../../utils/spinners.js";
import { ActivityType, Colors, EmbedBuilder, PresenceUpdateStatus, TextBasedChannel } from "discord.js";
import client from "../../clientLogin.js";
import { clientConnectionStatus } from "../../clientLogin.js";


export const event = {
    name: 'disconnected',
    mongoose: true,
    async execute() {
        clientConnectionStatus.isMongoDBConnected = false;
        spinnerMongodbLogin.fail(chalk.red.bold(`MongoDB connection failed! --> Attempting to reconnect...`));

        if (clientConnectionStatus.isStandby === false) {
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
                activities: [{ name: 'Standby mode', type: ActivityType.Custom }],
                status: PresenceUpdateStatus.DoNotDisturb,
            })
            clientConnectionStatus.isStandby = true;
        }
    }
}