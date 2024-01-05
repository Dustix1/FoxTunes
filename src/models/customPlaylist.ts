import mongoose from 'mongoose';

let customPlaylistCache: mongoose.Model<any, any>[] = [];


export function createCustomPlaylist(name: string) {

    const trackSchema = new mongoose.Schema({
        track: { type: String, required: true },
        artworkUrl: { type: String, required: true },
        sourceName: { type: String, required: true },
        title: { type: String, required: true },
        identifier: { type: String, required: true },
        author: { type: String, required: true },
        duration: { type: Number, required: true },
        isSeekable: { type: Boolean, required: true },
        isStream: { type: Boolean, required: true },
        uri: { type: String, required: true },
        thumbnail: { type: String, required: false },
        requester: { type: Object, required: false },
    });

    const customPlaylistSchema = new mongoose.Schema({
        userId: {
            type: String,
            required: true,
            unique: true
        },
        songs: [trackSchema]
    });

    const customPlaylist = mongoose.model(name, customPlaylistSchema, name.toLowerCase());
    customPlaylistCache.push(customPlaylist);
    return customPlaylist;
}

export default customPlaylistCache;