import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const url = process.env.MONGODB_URI;

export async function connectDB() {
  if (!url) throw new Error("Missing database connection string");
  await mongoose.connect(url, {
    dbName: "incidents",
  });
  console.log("Connected to database");
}
