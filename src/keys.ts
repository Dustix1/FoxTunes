import { getEnvVar } from './utils/env.js';

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN'),
    clientID: getEnvVar('CLIENT_ID'),
    lavalinkPassword: getEnvVar('LAVALINK_PASSWORD'),
    mode: getEnvVar('MODE'),
    mainColor: '#ff7700',
    secondaryColor: '#ffaa00',
    prefix: getEnvVar('PREFIX'),
    ownerID: getEnvVar('OWNER_ID'),
    mongodbURI: getEnvVar('MONGODB_URI'),
    mongodbUsername: getEnvVar('MONGODB_USER'),
    mongodbPassword: getEnvVar('MONGODB_PWD'),
} as const;

export default Keys;