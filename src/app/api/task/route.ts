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
    user: userId,
    tags: body.tags,
    selectedTraits: body.selectedTraits,
    traits: body.traits,
    outbid: body.outbid,
    blurOutbidMargin: body.outbid ? body.blurOutbidMargin : null,
    openseaOutbidMargin: body.outbid ? body.openseaOutbidMargin : null,
    magicedenOutbidMargin: body.outbid ? body.magicedenOutbidMargin : null,
    counterbid: body.counterbid,
    pauseAllBids: body.pauseAllBids,
    stopAllBids: body.stopAllBids,
    cancelAllBids: body.cancelAllBids,
  });
  return NextResponse.json(task, { status: 201 });
}
