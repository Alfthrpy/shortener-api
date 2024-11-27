import mongoose from "../db/connection.js";

const linkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Referensi ke User
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Link = mongoose.model("Link", linkSchema);
export default Link;
