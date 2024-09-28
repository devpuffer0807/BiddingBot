import Wallet from "@/models/wallet.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connect();
  const userId = await getUserIdFromCookies(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallets = await Wallet.find({ user: userId }).sort({ createdAt: -1 });
  return NextResponse.json(wallets, { status: 200 });
}

export async function POST(request: NextRequest) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const wallet = await Wallet.create({ ...body, user: userId });
  return NextResponse.json(wallet, { status: 201 });
}
