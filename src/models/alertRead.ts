import mongoose from "mongoose";

const alertReadSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    alerts: {
        type: Map,
        of: Boolean,
    }
});

const alertReadModel = mongoose.model('alertRead', alertReadSchema);
export default alertReadModel;