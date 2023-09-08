import fs from 'node:fs';
import path from 'node:path';
import Keys from '../keys.js';

import client from '../clientLogin.js';

const eventsPath = path.join(process.cwd(),  Keys.mode === 'development' ? './src/events' : './dist/events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: any) =>  Keys.mode === 'development' ? file.endsWith('.ts') : file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = 'file://' + path.join(eventsPath, file);
    import(filePath).then((module) => {
        let event = module.event;
	    if (event.once) {
		    client.once(event.name, (...args) => event.execute(...args));
	    } else {
		    client.on(event.name, (...args) => event.execute(...args));
	    }
    })
}