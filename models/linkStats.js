import mongoose from "../db/connection.js";

const linkStatsSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: "Link", required: true }, // Referensi ke Link
    date: { type: Date, required: true },
    clicks: { type: Number, default: 0 },
});

const LinkStats = mongoose.model("LinkStats", linkStatsSchema);
export default LinkStats;
