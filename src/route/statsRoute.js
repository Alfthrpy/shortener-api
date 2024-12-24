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
  
  if (linkId === "total") {
    try {
      // Jika linkId adalah "total", ambil total klik seluruh link
      const totalClicks = await LinkStats.aggregate([
        { $group: { _id: null, totalClicks: { $sum: "$clicks" } } },
      ]);

      return res.json({ total_clicks: totalClicks[0]?.totalClicks || 0 }).status(200);
    } catch (error) {
      console.error("Error fetching total clicks for all links:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    try {
      // Konversi linkId ke ObjectId
      const objectId = new mongoose.Types.ObjectId(linkId);

      const link = await Link.findById(objectId);
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }

      // Query total clicks per link
      const totalClicks = await LinkStats.aggregate([
        { $match: { linkId: objectId } },
        { $group: { _id: null, totalClicks: { $sum: "$clicks" } } },
      ]);


      if(totalClicks[0]?.totalClicks === undefined){
        return res.json({message : "No clicks yet"}).status(200);
      }


      // Fungsi untuk menghitung frekuensi lokasi dan perangkat
      function countFrequencies(arr) {
        return arr.reduce((acc, value) => {
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        }, {});
      }

      // Query daily, weekly, and monthly clicks per link
      const dailyClicks = await LinkStats.aggregate([
        { $match: { linkId: objectId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            clicks: { $sum: "$clicks" },
            devices: { $push: "$device" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const weeklyClicks = await LinkStats.aggregate([
        { $match: { linkId: objectId } },
        {
          $group: {
            _id: { year: { $year: "$date" }, week: { $isoWeek: "$date" } },
            clicks: { $sum: "$clicks" },
            devices: { $push: "$device" },
          },
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
      ]);

      const monthlyClicks = await LinkStats.aggregate([
        { $match: { linkId: objectId } },
        {
          $group: {
            _id: { year: { $year: "$date" }, month: { $month: "$date" } },
            clicks: { $sum: "$clicks" },
            devices: { $push: "$device" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Format the response with frequency counting
      const response = {
        total_clicks: totalClicks[0]?.totalClicks || 0,
        daily_clicks: Object.fromEntries(
          dailyClicks.map((d) => [
            d._id,
            {
              clicks: d.clicks,
              devices: countFrequencies(d.devices),
            },
          ])
        ),
        weekly_clicks: Object.fromEntries(
          weeklyClicks.map((w) => [
            `${w._id.year}-W${w._id.week}`,
            {
              clicks: w.clicks,
              devices: countFrequencies(w.devices),
            },
          ])
        ),
        monthly_clicks: Object.fromEntries(
          monthlyClicks.map((m) => [
            `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
            {
              clicks: m.clicks,
              devices: countFrequencies(m.devices),
            },
          ])
        ),
      };

      return res.json(response).status(200);
    } catch (error) {
      console.error("Error fetching link stats:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});




export default router;
