import { NextResponse } from "next/server"
import { connectToDB } from "../../../lib/mongodb";
import Staff from "../../../models/Staff";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    await connectToDB()

    const staff = await Staff.findOne({ email })

    if (!staff) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, staff.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    // ✅ Return correct structure
    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        _id: staff._id,
        name: staff.name,
        role: staff.role,
        department: staff.department
      }
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}