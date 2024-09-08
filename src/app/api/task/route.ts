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
    blurOutbidMargin: body.outbid ? body.blurOutbidMargin : null, // Add this line
    openseaOutbidMargin: body.outbid ? body.openseaOutbidMargin : null, // Add this line
    magicedenOutbidMargin: body.outbid ? body.magicedenOutbidMargin : null, // Add this line
    counterbid: body.counterbid, // Add this line
    pauseAllBids: body.pauseAllBids, // Add this line
    stopAllBids: body.stopAllBids, // Add this line
    cancelAllBids: body.cancelAllBids, // Add this line
  });
  return NextResponse.json(task, { status: 201 });
}
