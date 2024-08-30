import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { connect } from "@/utils/mongodb";

config();

export async function POST(request: Request) {
  try {
    await connect();

    const { email, password }: IAuthBody = await request.json();

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: true, message: "Invalid email or password" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        signupForUpdates: user.signupForUpdates,
      },
    });

    const maxAge = 7 * 24 * 60 * 60;
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Error signing in:", error);
    return NextResponse.json(
      {
        error: true,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

interface IAuthBody {
  email: string;
  password: string;
}
