import mongoose from "../db/connection.js";

const linkSchema = new mongoose.Schema({
    title : {type : String,required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Referensi ke User
    originalUrl: { type: String, required: true },
    customUrl: { type: String, required: false },
    shortUrl: { type: String, required: false },
    qr : { type: String, required: false},
    createdAt: { type: Date, default: Date.now },
});

const Link = mongoose.model("Link", linkSchema);
export default Link;
