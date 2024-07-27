import mongoose from "mongoose";

const alertsSchema = new mongoose.Schema({
    alertEmbedDesc: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now() + 7200000
    },
});

const alertsModel = mongoose.model('alerts', alertsSchema);
export default alertsModel;