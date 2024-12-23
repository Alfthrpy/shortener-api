import express from "express";
import Link from "../../models/link.js"; // Pastikan path ini sesuai
import User from "../../models/user.js"; // Pastikan path ini sesuai
import LinkStats from "../../models/linkStats.js";
import shortid from "shortid";
import requestIp from "request-ip";
import { getLocationByIp,getDeviceDetails } from "../../utils/getClientInfo.js";

/**
 * @swagger
 * /api/shortener/{id}:
 *   get:
 *     summary: Get short link details by ID
 *     tags:
 *       - Shortener
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the short link
 *     responses:
 *       200:
 *         description: The short link details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Link'
 *       404:
 *         description: Link not found
 */

/**
 * @swagger
 * /api/shortener:
 *   post:
 *     summary: Create a new short link
 *     tags:
 *       - Shortener
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user creating the short link
 *               originalUrl:
 *                 type: string
 *                 description: The original URL to be shortened
 *     responses:
 *       201:
 *         description: Short link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Link'
 *       400:
 *         description: Missing required fields
 */

/**
 * @swagger
 * /{shortId}:
 *   get:
 *     summary: Redirect to the original URL based on the short ID
 *     tags:
 *       - Shortener
 *     parameters:
 *       - in: path
 *         name: shortId
 *         required: true
 *         schema:
 *           type: string
 *         description: The short ID of the link
 *     responses:
 *       302:
 *         description: Redirect to the original URL
 *       404:
 *         description: Link not found
 */

/**
 * @swagger
 * /api/shortener/{id}:
 *   put:
 *     summary: Update an existing short link
 *     tags:
 *       - Shortener
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the short link to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 description: The new original URL
 *     responses:
 *       200:
 *         description: Link updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Link'
 *       404:
 *         description: Link not found
 */

/**
 * @swagger
 * /api/shortener/{id}:
 *   delete:
 *     summary: Delete a short link
 *     tags:
 *       - Shortener
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the short link to delete
 *     responses:
 *       200:
 *         description: Link deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 link:
 *                   $ref: '#/components/schemas/Link'
 *       404:
 *         description: Link not found
 */

const router = express.Router();
router.get("/api/shortener/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Link.findById(id);
    if (!data) {
      return res.json({ message: "Not Found" }).status(404);
    }

    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal Error" }).status(500);
  }
});

// Create a new short link
router.post("/api/shortener", async (req, res) => {
  const { title, userId, originalUrl, customUrl, shortUrl, qr } = req.body;

  // Validasi input
  if (!userId || !originalUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Tambahkan prefix jika originalUrl tidak memiliki protokol
  const formattedUrl = /^https?:\/\//i.test(originalUrl)
    ? originalUrl
    : `http://${originalUrl}`;

  try {
    // Periksa apakah userId valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Simpan link baru ke database
    const newLink = new Link({
      title,
      userId,
      originalUrl: formattedUrl,
      customUrl,
      shortUrl,
      qr,
    });
    const savedLink = await newLink.save();

    // Tambahkan ID link ke array 'links' di user yang sesuai
    user.links.push(savedLink._id);
    await user.save();

    return res
      .status(201)
      .json({ message: "Short link created successfully", link: savedLink });
  } catch (error) {
    console.error("Error creating link:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const clientIp = requestIp.getClientIp(req);
  const userAgent = req.headers["user-agent"];
  console.log(shortId);

  try {
    // Mencari link berdasarkan shortUrl (id)
    const link = await Link.findOne({ shortUrl: shortId });

    // Jika link tidak ditemukan, kirim respons error 404
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Mendapatkan lokasi dan detail perangkat
    const location = await getLocationByIp(clientIp);
    const device = getDeviceDetails(userAgent);

    // Debugging: Pastikan lokasi dan device diambil dengan benar
    console.log("Location: ", location); // Cek apakah location valid
    console.log("Device: ", device); // Cek apakah device valid

    // Menambahkan atau memperbarui entri di LinkStats
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const today = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Melakukan update atau memasukkan data statistik
    const linkStats = await LinkStats.findOneAndUpdate(
      { linkId: link._id, date: today }, // Cari berdasarkan linkId dan tanggal
      { 
        $inc: { clicks: 1 }, // Tambahkan jumlah klik
        $set: { 
          city: location.city || "Unknown", // Pastikan ada default value
          country: location.country || "Unknown", // Pastikan ada default value
          device: device.os || "Unknown", // Pastikan ada default value
        }
      },
      { upsert: true } // Buat dokumen baru jika tidak ditemukan
    );

    console.log("LinkStats updated: ", linkStats); // Pastikan linkStats berhasil di-update

    // Melakukan redirect ke originalUrl
    return res.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error fetching link:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});




router.put("/api/shortener/:id", async (req, res) => {
  const id = req.params.id;
  const { originalUrl } = req.body;
  console.log(id, originalUrl);

  const formattedUrl = /^https?:\/\//i.test(originalUrl)
    ? originalUrl
    : `http://${originalUrl}`;

  const shortUrl = shortid.generate();
  try {
    const updatedLink = await Link.findByIdAndUpdate(
      id,
      { originalUrl: formattedUrl, shortUrl },
      { new: true, runValidators: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ error: "Link not found" });
    }
    return res
      .status(200)
      .json({ message: "Link updated successfully", link: updatedLink });
  } catch (error) {
    console.error("Error updating link:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/api/shortener/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Menghapus link berdasarkan ID
    const deletedLink = await Link.findByIdAndDelete(id);

    if (!deletedLink) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Menghapus semua referensi di koleksi LinkStats
    await LinkStats.deleteMany({ linkId: deletedLink._id });

    // Menghapus referensi link di User
    await User.updateMany(
      { links: deletedLink._id }, // Cari user yang memiliki link tersebut
      { $pull: { links: deletedLink._id } } // Hapus link dari array links
    );

    return res
      .status(200)
      .json({ message: "Link deleted successfully", link: deletedLink });
  } catch (error) {
    console.error("Error deleting link:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
