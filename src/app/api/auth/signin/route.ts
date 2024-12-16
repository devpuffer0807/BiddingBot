import { NextResponse } from "next/server";
import * as jose from "jose";
import { config } from "dotenv";
import { connect } from "@/utils/mongodb";
import { CreateCredential } from "@/interface/web-authn.interface";

config();

export async function POST(request: Request) {
  try {
    await connect();

    const body = await request.json();
    const { credential } = body;

    const webAuthnCred = credential as CreateCredential;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ userId: webAuthnCred.rawId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      message: "Passkey verified",
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
