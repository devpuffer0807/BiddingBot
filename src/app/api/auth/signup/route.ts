import { NextResponse } from "next/server";
import * as jose from "jose";
import { config } from "dotenv";
import { CreateCredential } from "@/interface/web-authn.interface";

config();

export async function POST(request: Request) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const body = await request.json();
    const { credential } = body;
    const webAuthnCred = credential as CreateCredential;

    const response = NextResponse.json({
      message: "Account created",
    });

    const token = await new jose.SignJWT({ userId: webAuthnCred.rawId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const maxAge = 7 * 24 * 60 * 60;
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
