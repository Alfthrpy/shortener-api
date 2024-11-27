import mongoose from "mongoose";
import express from "express";
import LinkStats from "../../models/linkStats.js";
import Link from "../../models/link.js";

/**
 * @swagger
 * /api/stats/{linkId}:
 *   get:
 *     summary: Get statistics for a specific short link by linkId
 *     tags:
 *       - Shortener
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the link for which to fetch the stats
 *     responses:
 *       200:
 *         description: Statistics for the given short link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_clicks:
 *                   type: integer
 *                   description: Total number of clicks for the link
 *                 daily_clicks:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: Number of clicks per day
 *                 weekly_clicks:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: Number of clicks per week
 *                 monthly_clicks:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: Number of clicks per month
 *       404:
 *         description: Link not found
 *       500:
 *         description: Internal server error
 */


const router = express.Router();

router.get("/:linkId", async (req, res) => {
  const linkId = req.params.linkId;

  try {
    // Konversi linkId ke ObjectId
    const objectId = new mongoose.Types.ObjectId(linkId);

    const link = await Link.findById(objectId);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Query total clicks
    const totalClicks = await LinkStats.aggregate([
      { $match: { linkId: objectId } },
      { $group: { _id: null, totalClicks: { $sum: "$clicks" } } },
    ]);

    // Query daily clicks
    const dailyClicks = await LinkStats.aggregate([
      { $match: { linkId: objectId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          clicks: { $sum: "$clicks" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Query weekly clicks
    const weeklyClicks = await LinkStats.aggregate([
      { $match: { linkId: objectId } },
      {
        $group: {
          _id: { year: { $year: "$date" }, week: { $isoWeek: "$date" } },
          clicks: { $sum: "$clicks" },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    // Query monthly clicks
    const monthlyClicks = await LinkStats.aggregate([
      { $match: { linkId: objectId } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          clicks: { $sum: "$clicks" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format the response
    const response = {
      total_clicks: totalClicks[0]?.totalClicks || 0,
      daily_clicks: Object.fromEntries(
        dailyClicks.map((d) => [d._id, d.clicks])
      ),
      weekly_clicks: Object.fromEntries(
        weeklyClicks.map((w) => [`${w._id.year}-W${w._id.week}`, w.clicks])
      ),
      monthly_clicks: Object.fromEntries(
        monthlyClicks.map((m) => [
          `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
          m.clicks,
        ])
      ),
    };

    return res.json(response).status(200);
  } catch (error) {
    console.error("Error fetching link stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
