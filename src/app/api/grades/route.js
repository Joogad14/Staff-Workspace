import { connectToDB } from "@/app/lib/mongodb";
import Grade from "@/app/models/Grade";
import Submission from "@/app/models/Submission";

export async function POST(req) {
  try {
    await connectToDB();

    const { userId, taskId, score, gradedBy } = await req.json();

    if (!userId || !taskId || score == null || !gradedBy) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400 }
      );
    }

    // Save grade
    const grade = await Grade.create({
      userId,
      taskId,
      score,
      gradedBy,
    });

    // Optionally, update submission with reference to this grade
    await Submission.findByIdAndUpdate(taskId, { $push: { grades: grade._id } });

    return new Response(
      JSON.stringify({ message: "Grade submitted", grade }),
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}