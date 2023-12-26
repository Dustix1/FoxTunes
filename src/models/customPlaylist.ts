import mongoose from 'mongoose';

let customPlaylistSongsCache: mongoose.Model<any, any>[] = [];

export function createCustomPlaylist(name: string) {

    const customPlaylistSchema = new mongoose.Schema({
        userId: {
            type: String,
            required: true,
            unique: true
        },
        songs: {
            type: [String],
            required: true
        }
    });
    
    const customPlaylist = mongoose.model(name, customPlaylistSchema, name.toLowerCase());
    customPlaylistSongsCache.push(customPlaylist);
    return customPlaylist;
}

export default customPlaylistSongsCache;