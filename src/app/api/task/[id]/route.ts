import Task from "@/models/task.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import { isObjectIdOrHexString } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

async function checkTaskOwnership(taskId: string, userId: string) {
  const task = await Task.findOne({ _id: taskId, user: userId });
  return task !== null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const taskId = params.id;

  if (!isObjectIdOrHexString(taskId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = await checkTaskOwnership(params.id, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const task = await Task.findById(taskId);
  return NextResponse.json(task, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const taskId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObjectIdOrHexString(taskId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const isOwner = await checkTaskOwnership(taskId, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json();
  const task = await Task.findByIdAndUpdate(
    params.id,
    {
      ...body,
      tags: body.tags,
      selectedTraits: body.selectedTraits,
      traits: body.traits,
      outbid: body.outbid,
      blurOutbidMargin: body.outbid ? body.blurOutbidMargin : null, // Add this line
      openseaOutbidMargin: body.outbid ? body.openseaOutbidMargin : null, // Add this line
      magicedenOutbidMargin: body.outbid ? body.magicedenOutbidMargin : null, // Add this line
    },
    { new: true }
  );
  return NextResponse.json(task, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const taskId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObjectIdOrHexString(taskId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const isOwner = await checkTaskOwnership(taskId, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await Task.findByIdAndDelete(taskId);
  return NextResponse.json(
    { message: "Task deleted successfully" },
    { status: 200 }
  );
}
