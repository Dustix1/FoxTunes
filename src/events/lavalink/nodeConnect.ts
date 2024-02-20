import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";
import { ActivityType, PresenceUpdateStatus } from "discord.js";
import client from "../../clientLogin.js";
import { clientConnectionStatus } from "../../clientLogin.js";


export const event = {
    name: 'nodeConnect',
    manager: true,
    async execute() {
        clientConnectionStatus.isLavalinkConnected = true;
        spinnerLavalinkLogin.succeed(chalk.green(`Lavalink connection established!`));
        fetch('https://ntfy.sh/robinjebestphasduo', {
            method: 'POST', // PUT works too
            body: 'Lavalink connection established!',
            headers: {
                'Icon': client.user!.displayAvatarURL(),
                'Title': 'FoxTunes is now online!',
                'Priority': 'default',
                'Tags': 'heavy_check_mark',
                'Click': 'https://discord.com/app'
            }
        })

        client.user!.setPresence({
            activities: [{ name: '!help', type: ActivityType.Listening }],
            status: PresenceUpdateStatus.Online,
        })
        clientConnectionStatus.isStandby = false;
    }
}