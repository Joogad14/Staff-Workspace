import { connectToDB } from "../../lib/mongodb";
import Submission from "../../models/Submission";
import Grade from "../../models/Grade";
import Staff from "../../models/Staff";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ---------------- GET ----------------
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || !isValidObjectId(userId)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing userId" }),
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const submissions = await Submission.find({ user: objectUserId })
      .sort({ createdAt: -1 })
      .lean();

    const grades = await Grade.find({ userId: objectUserId }).lean();

    const mergedSubmissions = submissions.map(sub => {
      const gradeRecord = grades.find(
        g => g.taskId.toString() === sub._id.toString()
      );

      return {
        ...sub,
        grade: gradeRecord ? gradeRecord.score : null
      };
    });

    return new Response(
      JSON.stringify({ submissions: mergedSubmissions }),
      { status: 200 }
    );

  } catch (err) {
    console.error("SUBMISSION FETCH ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch submissions" }),
      { status: 500 }
    );
  }
}

// ---------------- POST ----------------
export async function POST(req) {
  try {
    await connectToDB();

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const link = formData.get("link");
    const userId = formData.get("userId");
    const file = formData.get("file");

    if (!title || !description || !userId || !isValidObjectId(userId)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const staff = await Staff.findById(userId).lean();
    const staffNameFromDB = staff?.name || "Unknown";

    let filePath = null;

    if (file && file.size > 0) {

      // ---------------- FILE TYPE VALIDATION ----------------
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
      ];

      const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf"];

      const ext = file.name.split(".").pop().toLowerCase();

      if (
        !allowedMimeTypes.includes(file.type) ||
        !allowedExt.includes(ext)
      ) {
        return new Response(
          JSON.stringify({ error: "Only images (JPG/PNG/WEBP) and PDFs are allowed" }),
          { status: 400 }
        );
      }

      // ---------------- FILE SIZE VALIDATION ----------------
      if (file.size > 3 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "File size exceeds 3MB" }),
          { status: 400 }
        );
      }

      // ---------------- SAFE FILE NAME ----------------
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const fileName = `${Date.now()}_${safeName}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      fs.writeFileSync(
        path.join(uploadsDir, fileName),
        buffer
      );

      filePath = `/uploads/${fileName}`;
    }

    const submission = await Submission.create({
      title,
      description,
      link,
      fileUrl: filePath,
      user: new mongoose.Types.ObjectId(userId),
      staffName: staffNameFromDB,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        submission: { ...submission.toObject(), grade: null }
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("SUBMISSION POST ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create submission" }),
      { status: 500 }
    );
  }
}