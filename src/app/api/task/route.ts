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
  const bidDurationInSeconds = convertToSeconds(body.bidDuration); // Add this line
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
    stopOptions: {
      minFloorPrice: body.stopOptions.minFloorPrice,
      maxFloorPrice: body.stopOptions.maxFloorPrice,
      minTraitPrice: body.stopOptions.minTraitPrice,
      maxTraitPrice: body.stopOptions.maxTraitPrice,
      maxPurchase: body.stopOptions.maxPurchase,
      pauseAllBids: body.stopOptions.pauseAllBids,
      stopAllBids: body.stopOptions.stopAllBids,
      cancelAllBids: body.stopOptions.cancelAllBids,
      triggerStopOptions: body.stopOptions.triggerStopOptions,
    },
    bidDuration: bidDurationInSeconds, // Add this line
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const { ids, running } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await Task.updateMany(
    { _id: { $in: ids }, user: userId },
    { $set: { running } }
  );

  return NextResponse.json(
    { modifiedCount: tasks.modifiedCount },
    { status: 200 }
  );
}

// Helper function to convert duration to seconds
const convertToSeconds = (duration: { value: number; unit: string }) => {
  const { value, unit } = duration;
  switch (unit) {
    case "minutes":
      return value * 60;
    case "hours":
      return value * 3600;
    case "days":
      return value * 86400;
    default:
      return value; // Assuming seconds if no unit is provided
  }
};
