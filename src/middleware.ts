import { NextResponse, type NextRequest } from "next/server";
import { authMiddleware } from "./middleware/authMiddleware";

export function runMiddleware(request: NextRequest) {
  // Run auth middleware
  const authResponse = authMiddleware(request);
  if (authResponse !== NextResponse.next()) {
    return authResponse;
  }

  // If all middleware pass, continue to the next middleware or route handler
  return NextResponse.next();
}
export function middleware(request: NextRequest) {
  return runMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
