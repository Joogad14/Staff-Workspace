import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testMongo() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully");

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

testMongo();