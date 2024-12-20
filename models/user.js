import mongoose from "../db/connection.js";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_pic : { type: String, required: true},
  isVerified: { type: Boolean, default: false }, // Untuk verifikasi email
  resetPasswordToken: { type: String }, // Token untuk reset password
  resetPasswordExpires: { type: Date }, // Batas waktu token reset password
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: "Link" }], // Referensi ke Link
});

// Hash password sebelum menyimpan data
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metode untuk mencocokkan password
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("Inputted password in login:", enteredPassword, "Hashed password:", this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;