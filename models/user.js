import mongoose from "../db/connection.js";
import bcrypt from "bcryptjs";  // Mengimpor bcryptjs

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: "Link" }], // Referensi ke Link
});

// Sebelum menyimpan data, hash password jika password baru dimodifikasi
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Fungsi untuk mencocokkan password yang dimasukkan dengan yang disimpan di database
userSchema.methods.matchPassword = async function (enteredPassword) {
    console.log("inputed password in login : " + enteredPassword, "hashed password " + this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
