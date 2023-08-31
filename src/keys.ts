import { getEnvVar } from './utils/env.js';

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN'),
    clientID: getEnvVar('CLIENT_ID'),
    lavalinkPassword: getEnvVar('LAVALINK_PASSWORD'),
} as const;

export default Keys;