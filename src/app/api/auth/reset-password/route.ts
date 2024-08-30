import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { connect } from "@/utils/mongodb";
import { passwordResetEmail } from "@/utils/emails/password-reset-email";

config();

export async function GET(request: Request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: true, message: "Invalid token" },
        { status: 400 }
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, error: false });
  } catch (error: any) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: true, message: "Invalid token" },
        { status: 400 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      exp: number;
    };

    // Check if token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return NextResponse.json(
        { error: true, message: "Token has expired" },
        { status: 400 }
      );
    }

    const userId = decoded.userId;
    const body: IUpdatePasswordBody = await request.json();

    // Validate password strength
    if (!isPasswordStrong(body.password)) {
      return NextResponse.json(
        {
          error: true,
          message: "Password does not meet strength requirements",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: true, message: "User not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
    // Remove token cookie after password reset
    response.headers.append(
      "Set-Cookie",
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
    return response;
  } catch (error: any) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: true, message: "An error occurred while updating the password" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connect();
    const body: IResetPasswordBody = await request.json();
    const existingUser = await User.findOne({ email: body.email });

    if (!existingUser) {
      // Use a generic message to prevent user enumeration
      return NextResponse.json({
        success: true,
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }

    const verificationToken = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "30m",
      }
    );

    const verificationUrl = `${process.env.CLIENT_URL}/auth/reset-password/success?token=${verificationToken}`;

    const html = passwordResetEmail(verificationUrl);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: existingUser.email,
      subject: "Password Reset",
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Error initiating password reset:", error);
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}

function isPasswordStrong(password: string): boolean {
  // Implement password strength checks (e.g., length, complexity)
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export interface IResetPasswordBody {
  email: string;
}

export interface IUpdatePasswordBody {
  password: string;
}
