import { connectToDB } from "../../lib/mongodb";
import Staff from "../../models/Staff";
import Verification from "../../models/Verification";
import Submission from "../../models/Submission";
import Grade from "../../models/Grade";
import Attendance from "../../models/Attendance";

export async function GET(req) {
  try {
    await connectToDB();

    const staffList = await Staff.find({ role: "staff" }).lean();

    const users = await Promise.all(
      staffList.map(async (staff) => {

        // ✅ ALWAYS GET LATEST VERIFICATION
        const verification = await Verification.findOne({ userId: staff._id })
          .sort({ createdAt: -1 })
          .lean();

        const submissions = await Submission.find({ user: staff._id }).lean();

        const grades = await Grade.find({ userId: staff._id }).lean();

        // ✅ FIX: DO NOT convert ObjectId to string
        const attendanceRecords = await Attendance.find({
          userId: staff._id,
        }).lean();

        const attendance = attendanceRecords.map((a) => {
          const parsedDate = new Date(a.date);
          return isNaN(parsedDate) ? a.date : parsedDate.toISOString();
        });

        return {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          department: staff.department,

          attendance,
          attendanceCount: attendance.length,

          submissions: submissions.map((sub) => {
            const matchedGrade = grades.find(
              (g) =>
                g.taskId &&
                g.taskId.toString() === sub._id.toString()
            );

            return {
              _id: sub._id,
              title: sub.title,
              description: sub.description,
              link: sub.link || null,
              fileUrl: sub.fileUrl || null,
              createdAt: sub.createdAt,
              grade: matchedGrade ? matchedGrade.score : null,
            };
          }),

          // ✅ SAFE & CONSISTENT VERIFICATION OBJECT
          verification: verification
            ? {
                _id: verification._id,
                status: verification.status || "pending",
                fileLink: `/api/verification/file/${verification._id}`,
                exists: true,
              }
            : {
                _id: null,
                status: "not_submitted",
                fileLink: null,
                exists: false,
              },
        };
      })
    );

    return new Response(JSON.stringify({ users }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}