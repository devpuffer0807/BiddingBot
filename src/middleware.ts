import { NextResponse, type NextRequest } from "next/server";
import { authMiddleware } from "./middleware/authMiddleware";

export function middleware(request: NextRequest) {
  // Apply auth middleware for dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    return authMiddleware(request);
  }

  // For all other routes, continue to the next middleware or route handler
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
