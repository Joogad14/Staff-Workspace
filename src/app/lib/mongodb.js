import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./.env.local") }); // ensures it loads your .env.local

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGODB_URI)
    throw new Error("Please define MONGODB_URI in .env.local");

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongoose) => {
        console.log("✅ MongoDB Connected Successfully from mongodb.js");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error from mongodb.js:", err);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Optional: test when running this file directly
if (process.argv[1].endsWith("mongodb.js")) {
  connectToDB().then(() => process.exit(0)).catch(() => process.exit(1));
}