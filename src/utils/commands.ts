import { glob } from 'glob';
import path from 'node:path';
import Keys from '../keys.js';

export let commandsMessage = new Map();
export let commandsSlash = new Map();

(async () => {
    let commandFiles;
    Keys.mode === 'development' ? commandFiles = await glob('src/commands/**/*.ts') : commandFiles = await glob('dist/commands/**/*.js');

    for (const file of commandFiles) {
        const filePath = 'file://' + path.join(process.cwd(), file);
        import(filePath).then((module) => {
            if (module.command.slash) {
                commandsSlash.set(module.command.data.name, module.command);
            } else {
                commandsMessage.set(module.command.name, module.command);
            }
        })
    }
})();