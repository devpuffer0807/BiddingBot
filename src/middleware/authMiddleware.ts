import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

export function authMiddleware(request: NextRequest) {
  const cookieStore = cookies();
  const tokenObject = cookieStore.get("token");
  const token = tokenObject?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const userId = decoded.userId;

    // Add the userId to the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-ID", userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    if (
      error instanceof JsonWebTokenError &&
      error.name === "TokenExpiredError"
    ) {
      // Handle expired token
      const response = NextResponse.redirect(
        new URL("/auth/signin", request.url)
      );
      response.cookies.delete("token");
      return response;
    }
    // Handle other JWT errors or invalid tokens
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}
