import chalk from "chalk";
import { spinnerLavalinkLogin } from "../../utils/spinners.js";

export const event = {
    name: 'nodeError',
    manager: true,
    async execute(error: any) {
        spinnerLavalinkLogin.fail(chalk.red.bold(`Lavalink connection failed! --> ${error.message}`));
        process.exit(1);
    }
}