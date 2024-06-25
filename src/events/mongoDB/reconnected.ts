import chalk from "chalk";
import { spinnerMongodbLogin } from "../../utils/spinners.js";
import { ActivityType, PresenceUpdateStatus } from "discord.js";
import client, { clientConnectionStatus } from "../../clientLogin.js";

export const event = {
    name: 'reconnected',
    mongoose: true,
    async execute() {
        spinnerMongodbLogin.succeed(chalk.green('Database connection successful!'));
        client.user!.setPresence({
            activities: [{ name: '!help', type: ActivityType.Listening }],
            status: PresenceUpdateStatus.Online,
        })
        clientConnectionStatus.isStandby = false;
        clientConnectionStatus.isMongoDBConnected = true;
    }
}