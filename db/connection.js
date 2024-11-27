import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.ATLAS_URI || "";

async function connectDB() {
  try {
    // Koneksi ke MongoDB menggunakan Mongoose
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout koneksi
      ssl: true,
      tlsAllowInvalidCertificates: true, // Sama seperti di MongoClient
    });

    console.log("Successfully connected to MongoDB using Mongoose!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Keluar jika koneksi gagal
  }
}

connectDB();

// Ekspor Mongoose instance untuk digunakan di file lain
export default mongoose;
