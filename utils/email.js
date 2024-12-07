import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const transporter = nodemailer.createTransport({
  service: "gmail", // Bisa diganti dengan layanan lain
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fungsi untuk mengirim email verifikasi
export const sendVerificationEmail = (userEmail, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const verificationLink = `${process.env.URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Verifikasi Email Anda",
    html: `<p>Klik link berikut untuk verifikasi email Anda:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
};