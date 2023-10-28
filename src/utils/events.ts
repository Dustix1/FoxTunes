import { glob } from 'glob';
import path from 'node:path';
import Keys from '../keys.js';

import client from '../clientLogin.js';

(async () => {
	let eventFiles;
	Keys.mode === 'development' ? eventFiles = await glob('src/events/**/*.ts') : eventFiles = await glob('dist/events/**/*.js');

	for (const file of eventFiles) {
		const filePath = 'file://' + path.join(process.cwd(), file);
		import(filePath).then((module) => {
			let event = module.event;
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args));
			} else if (event.manager) {
				client.manager.on(event.name, (...args) => event.execute(...args));
			} else {
				client.on(event.name, (...args) => event.execute(...args));
			}
		})
	}
})();