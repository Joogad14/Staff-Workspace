import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import mongoose from "mongoose";

// Simple staff schema
const staffSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export async function GET() {
  try {
    await connectToDB();
    const staffList = await Staff.find();
    return NextResponse.json({ staff: staffList });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}