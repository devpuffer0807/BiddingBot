import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import { emailTemplate } from "@/utils/emails/verification_email";
import { connect } from "@/utils/mongodb";

config();

export async function POST(request: Request) {
  try {
    await connect();
    const { name, email, password, signupForUpdates }: IAuthBody =
      await request.json();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: true, message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      signupForUpdates,
      isVerified: false,
    });

    const verificationToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify?token=${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "sales@nfttools.pro",
      to: newUser.email,
      subject: "Verify your email address",
      html: emailTemplate(verificationUrl),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent. Please check your inbox.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}

interface IAuthBody {
  name: string;
  email: string;
  password: string;
  signupForUpdates: boolean;
}
