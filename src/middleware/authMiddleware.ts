import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    console.log("No token found in cookie");
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    console.log("Token successfully verified:", decoded);

    // Add the userId to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-ID", decoded.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    // Only clear the token for specific JWT errors
    if (error instanceof JsonWebTokenError) {
      console.log("JWT error, clearing token");
      const response = NextResponse.redirect(
        new URL("/auth/signin", request.url)
      );
      response.cookies.delete("token");
      return response;
    }

    // For other errors, log but don't clear the token
    console.log("Unknown error, not clearing token");
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}
