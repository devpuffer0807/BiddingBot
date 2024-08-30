import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    cookieStore.delete("token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error during sign out:`, error);
    return NextResponse.json(
      { success: false, message: "An error occurred during sign out" },
      { status: 500 }
    );
  }
}
