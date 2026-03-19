import { NextResponse } from "next/server";
import { connectToDB } from "../../lib/mongodb";
import Verification from "../../models/Verification";

// POST → Upload verification file
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!userId || !file) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // Limit file size to 3MB
    if (arrayBuffer.byteLength > 3 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 3MB." }, { status: 400 });
    }

    await connectToDB();

    const verification = await Verification.create({
      userId,
      fileName: file.name,
      fileData: Buffer.from(arrayBuffer),
      contentType: file.type,
      status: "pending",
    });

    return NextResponse.json({ message: "Verification submitted", verification });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET → Check verification status
export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const verification = await Verification.findOne({ userId });

    if (!verification) {
      return NextResponse.json({ status: "not_submitted" });
    }

    return NextResponse.json({ status: verification.status });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH → Assessor updates verification status (approve/decline)
export async function PATCH(req) {
  try {
    await connectToDB();

    const { verificationId, status } = await req.json();

    if (!verificationId || !["approved", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid verificationId or status" }, { status: 400 });
    }

    const updatedVerification = await Verification.findByIdAndUpdate(
      verificationId,
      { status },
      { new: true }
    );

    return NextResponse.json({
      message: "Verification updated successfully",
      updatedVerification
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}