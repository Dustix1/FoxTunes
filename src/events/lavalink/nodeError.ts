import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";
import { ActivityType, PresenceUpdateStatus } from "discord.js";
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
            client.user?.setPresence({
                activities: [{ name: 'Standby mode', type: ActivityType.Custom }], // ▷▶NEW UPDATE◀◁
                status: PresenceUpdateStatus.DoNotDisturb,
            })
            lavalinkConnectionStatus.isStandby = true;
        }
    }
}