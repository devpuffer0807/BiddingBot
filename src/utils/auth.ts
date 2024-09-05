import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function getUserIdFromCookies(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    return null; // Return null if token verification fails
  }
}
