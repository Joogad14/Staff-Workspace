import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Attendance from "@/app/models/Attendance";

// POST: Sign attendance
export async function POST(req) {
  try {
    const { userId, date } = await req.json();

    await connectToDB();

    const exists = await Attendance.findOne({ userId, date });

    if (exists) {
      return NextResponse.json(
        { message: "Already signed today" },
        { status: 400 }
      );
    }

    const attendance = await Attendance.create({ userId, date });

    return NextResponse.json({
      message: "Attendance submitted",
      attendance,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Load attendance history
export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const attendance = await Attendance.find({ userId }).sort({ date: -1 });

    return NextResponse.json({
      attendance,
      total: attendance.length,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}