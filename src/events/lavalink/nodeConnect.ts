import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";
import { ActivityType, PresenceUpdateStatus } from "discord.js";
import client from "../../clientLogin.js";
import { lavalinkConnectionStatus } from "../../lavalinkLogin.js";


export const event = {
    name: 'nodeConnect',
    manager: true,
    async execute() {
        lavalinkConnectionStatus.isLavalinkConnected = true;
        spinnerLavalinkLogin.succeed(chalk.green(`Lavalink connection established!`));

            client.user!.setPresence({
                activities: [{ name: '!help', type: ActivityType.Listening }], // ▷▶NEW UPDATE◀◁
                status: PresenceUpdateStatus.Online,
            })
            lavalinkConnectionStatus.isStandby = false;
    }
}