import mongoose from "mongoose";

const playlistNamesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    playlists: {
        type: [String],
        required: true
    }
});

const playlistNames = mongoose.model('playlistNames', playlistNamesSchema);
export default playlistNames;