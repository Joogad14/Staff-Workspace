import { connectToDB } from "@/app/lib/mongodb";
import Staff from "@/app/models/Staff";

export async function GET(req) {
  try {

    await connectToDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const staff = await Staff.findById(userId);

    if (!staff) {
      return Response.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    return Response.json({
      name: staff.name,
      department: staff.department
    });

  } catch (error) {

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }
}