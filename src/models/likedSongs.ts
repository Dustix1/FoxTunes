import mongoose from "mongoose";

const likedSongsSchema = new mongoose.Schema({
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

const likedSongs = mongoose.model('likedSongs', likedSongsSchema);
export default likedSongs;