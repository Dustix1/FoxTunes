import { getEnvVar } from './utils/env.js';

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN'),
    clientID: getEnvVar('CLIENT_ID'),
    lavalinkPassword: getEnvVar('LAVALINK_PASSWORD'),
    mode: getEnvVar('MODE'),
    mainColor: '#ff7700',
} as const;

export default Keys;