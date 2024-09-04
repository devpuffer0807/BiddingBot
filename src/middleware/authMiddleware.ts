import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  console.log({ token });

  if (!token) {
    console.log("No token found in cookie");
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    console.log("Token successfully verified:", payload);

    // Add the userId to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-ID", payload.userId as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (
      error instanceof jose.errors.JWTExpired ||
      error instanceof jose.errors.JWTInvalid ||
      error instanceof jose.errors.JWTClaimValidationFailed
    ) {
      console.log("JWT error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });

      console.log("JWT error, clearing token");
      const response = NextResponse.redirect(
        new URL("/auth/signin", request.url)
      );
      response.cookies.delete("token");
      return response;
    }

    // For other errors, log more details and continue without redirecting
    console.log("Unknown error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.next();
  }
}
