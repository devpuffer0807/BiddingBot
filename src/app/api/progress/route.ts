import { getUserIdFromCookies } from "@/utils";
import redisClient from "@/utils/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = redisClient.getClient();

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromCookies(request);
  const {
    tasks,
  }: { tasks: { slug: string; selectedMarketplaces: string[] }[] } =
    await request.json();
  const orderCounts: { [slug: string]: { [key: string]: number } } = {};

  for (const task of tasks) {
    const { slug, selectedMarketplaces } = task; // Destructure slug and selectedMarketplaces

    for (const marketplace of selectedMarketplaces) {
      const pattern = `*:${marketplace.toLowerCase()}:order:${slug}:*`;
      const keys = await redis.keys(pattern);
      if (!orderCounts[slug]) {
        orderCounts[slug] = {};
      }
      orderCounts[slug][marketplace.toLowerCase()] = keys.length;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(orderCounts, { status: 200 });
}
