import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { connect } from "@/utils/mongodb";

config();

export async function GET(request: Request) {
  try {
    await connect();
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    const response = NextResponse.json({
      message: "Email verified successfully",
    });
    const cookieOptions = {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    };
    response.cookies.set("token", token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
