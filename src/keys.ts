import { getEnvVar } from './utils/env.js';

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN'),
    clientID: getEnvVar('CLIENT_ID'),
    lavalinkPassword: getEnvVar('LAVALINK_PASSWORD'),
    mode: getEnvVar('MODE'),
    mainColor: getEnvVar('MAIN_COLOR') as any,
    secondaryColor: getEnvVar('SECONDARY_COLOR') as any,
    prefix: getEnvVar('PREFIX'),
    ownerID: getEnvVar('OWNER_ID'),
    mongodbURI: getEnvVar('MONGODB_URI'),
    mongodbUsername: getEnvVar('MONGODB_USER'),
    mongodbPassword: getEnvVar('MONGODB_PWD'),
    nick: getEnvVar('NICK')
} as const;

export default Keys;