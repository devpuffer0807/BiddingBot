import Task from "@/models/task.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connect();
  const userId = await getUserIdFromCookies(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tasks = await Task.find({ user: userId });
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: NextRequest) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const task = await Task.create({
    ...body,
    contract: {
      slug: body.contract.slug,
      contractAddress: body.contract.contractAddress,
    },
    bidPrice: {
      min: body.bidPrice.min,
      max: body.bidPrice.max,
      minType: body.bidPrice.minType,
      maxType: body.bidPrice.maxType,
    },
    user: userId,
    tags: body.tags,
    selectedTraits: body.selectedTraits,
    traits: body.traits,
    outbidOptions: {
      outbid: body.outbidOptions.outbid,
      blurOutbidMargin: body.outbidOptions.outbid
        ? body.outbidOptions.blurOutbidMargin
        : null,
      openseaOutbidMargin: body.outbidOptions.outbid
        ? body.outbidOptions.openseaOutbidMargin
        : null,
      magicedenOutbidMargin: body.outbidOptions.outbid
        ? body.outbidOptions.magicedenOutbidMargin
        : null,
      counterbid: body.outbidOptions.counterbid,
    },
    pauseAllBids: body.pauseAllBids,
    stopAllBids: body.stopAllBids,
    cancelAllBids: body.cancelAllBids,
  });
  return NextResponse.json(task, { status: 201 });
}
