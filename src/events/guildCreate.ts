import { Events, Guild, PermissionsBitField } from "discord.js";
import logMessage from "../utils/logMessage.js";
import chalk from "chalk";
import { Keys } from "../keys.js";
import registerCommands from "../utils/registerSlashCommands.js";

export const event = {
    name: Events.GuildCreate,
    async execute(guild: Guild) {
        if ((await guild.members.fetchMe()).permissions.has(PermissionsBitField.Flags.Administrator)) {

            logMessage(`Joined ${chalk.hex(Keys.secondaryColor).bold(guild.name)} (${guild.id}) with admin perms.`);
            guild.members.fetchMe().then(me => me.setNickname('𝓕𝓸𝔁𝓣𝓾𝓷𝓮𝓼'));
            registerCommands();

        } else {
            logMessage(`${chalk.red.bold(`Joined ${chalk.hex(Keys.secondaryColor).bold(guild.name)} (${guild.id}) without admin perms.`)}`);

            guild.systemChannel?.send('I need administrator permissions to work properly.').catch(() => {
                logMessage(`${chalk.red.bold(`Failed to send message to ${chalk.hex(Keys.secondaryColor).bold(guild.name)} (${guild.id}) Leaving guild...`)}`);
                guild.leave();
            });
        }
    }
}