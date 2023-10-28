import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";

export const event = {
    name: 'nodeConnect',
    manager: true,
    async execute() {
        spinnerLavalinkLogin.succeed(chalk.green(`Lavalink connection established!`));
    }
}