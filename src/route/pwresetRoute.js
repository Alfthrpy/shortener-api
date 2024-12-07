import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import { transporter } from "../../utils/email.js"; // Pastikan fungsi email tersedia

const router = express.Router();

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a token and set expiration
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Generate reset link
    const resetLink = `${process.env.URL}/api/auth/reset-password?token=${token}`;

    // Send reset email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `<p>Klik link berikut untuk reset password Anda:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;