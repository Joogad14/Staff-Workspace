import { connectToDB } from "../../../../lib/mongodb";
import Verification from "../../../../models/Verification";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    // ✅ IMPORTANT: await params directly
    const { id } = await params;

    const file = await Verification.findById(id);

    if (!file || !file.fileData) {
      return new Response("File not found", { status: 404 });
    }

    const buffer = Buffer.from(file.fileData.buffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `inline; filename="${file.fileName}"`,
        "Content-Length": buffer.length,
      },
    });

  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
}