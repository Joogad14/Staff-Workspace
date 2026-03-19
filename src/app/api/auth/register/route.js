import { connectToDB } from "../../../lib/mongodb";
import Staff from "../../../models/Staff";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectToDB();
    let { name, email, password, role, department } = await req.json();

    if (!["assessor", "staff"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

     // Auto-assign department for assessor if not provided
    if (role === "assessor" && !department) {
        department = "Assessment Department";
    }

    // Check if email exists
    const exists = await Staff.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new Staff({
      name,
      email,
      password: hashedPassword,
      role, // assessor or staff
      department,
    });
    await staff.save();

    return NextResponse.json({ message: "Staff created successfully", staffId: staff._id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};