import { NextResponse, type NextRequest } from "next/server";
import { authMiddleware } from "./middleware/authMiddleware";

export async function middleware(request: NextRequest) {
  return await authMiddleware(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
