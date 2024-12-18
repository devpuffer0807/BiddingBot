import Wallet from "@/models/wallet.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import { isObjectIdOrHexString } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

async function checkWalletOwnership(walletId: string, userId: string) {
  const wallet = await Wallet.findOne({ _id: walletId, user: userId });
  return wallet !== null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const walletId = params.id;

  if (!isObjectIdOrHexString(walletId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = await checkWalletOwnership(walletId, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const wallet = await Wallet.findById(walletId);
  return NextResponse.json(wallet, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const walletId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObjectIdOrHexString(walletId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const isOwner = await checkWalletOwnership(walletId, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const body = await request.json();
  const wallet = await Wallet.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(wallet, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const address = params.id;

  console.log({ address });

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Wallet.deleteOne({
    address: { $regex: new RegExp(`^${address}$`, "i") },
  });
  return NextResponse.json(
    { message: "Wallet deleted successfully" },
    { status: 200 }
  );
}
