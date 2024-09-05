import Tag from "@/models/tag.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import { isObjectIdOrHexString } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

async function checkTagOwnership(tagId: string, userId: string) {
  const tag = await Tag.findOne({ _id: tagId, user: userId });
  return tag !== null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const tagId = params.id;

  if (!isObjectIdOrHexString(tagId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = await checkTagOwnership(params.id, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const tag = await Tag.findById(tagId);
  return NextResponse.json(tag, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const tagId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObjectIdOrHexString(tagId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const isOwner = await checkTagOwnership(tagId, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const body = await request.json();
  const tag = await Tag.findByIdAndUpdate(
    tagId,
    { ...body, tags: body.tags },
    { new: true }
  ); // Add tags
  return NextResponse.json(tag, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const tagId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObjectIdOrHexString(tagId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const isOwner = await checkTagOwnership(tagId, userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Taf not found" }, { status: 404 });
  }

  await Tag.findByIdAndDelete(params.id);
  return NextResponse.json(
    { message: "Tag deleted successfully" },
    { status: 200 }
  );
}
