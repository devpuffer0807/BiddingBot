import Task, { ITask } from "@/models/task.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import redisClient from "@/utils/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = redisClient.getClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await connect();
  const userId = await getUserIdFromCookies(request);
  const slug = params.slug;
  const task = (await Task.findOne({
    "contract.slug": slug,
  })) as unknown as ITask;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const tokenIds = task.tokenIds;
  const bidType =
    task.bidType.toLowerCase() === "collection" &&
    Object.keys(task?.selectedTraits || {}).length > 0
      ? "TRAIT"
      : task.tokenIds.length > 0
      ? "TOKEN"
      : "COLLECTION";

  const selectedMarketplaces = task.selectedMarketplaces;
  const selectedTraits = task.selectedTraits;
  const orderKeys: string[] = [];

  if (bidType === "TOKEN") {
    for (const marketplace of selectedMarketplaces) {
      const isBlur = marketplace.toLowerCase() === "blur";
      const baseKey = `${marketplace.toLowerCase()}:order:${slug}`;

      if (isBlur) {
        orderKeys.push(`${baseKey}:default`);
      } else {
        orderKeys.push(...tokenIds.map((token) => `${baseKey}:${token}`));
      }
    }
  } else if (bidType === "TRAIT") {
    for (const marketplace of selectedMarketplaces) {
      const baseKey = `${marketplace.toLowerCase()}:order:${slug}`;

      for (const traitType in selectedTraits) {
        for (const trait of selectedTraits[traitType]) {
          switch (marketplace.toLowerCase()) {
            case "magiceden":
              const meTraitObject = JSON.stringify({
                attributeKey: traitType,
                attributeValue: trait.name,
              });
              orderKeys.push(`${baseKey}:${meTraitObject}`);
              break;
            case "blur":
              const blurTraitObject = JSON.stringify({
                [traitType]: trait.name,
              });
              orderKeys.push(`${baseKey}:${JSON.stringify(blurTraitObject)}`);
              break;
            case "opensea":
              orderKeys.push(`${baseKey}:trait:${traitType}:${trait.name}`);
              break;
            default:
              orderKeys.push(`${baseKey}:${traitType}:${trait.name}`);
          }
        }
      }
    }
  } else if (bidType === "COLLECTION") {
    for (const marketplace of selectedMarketplaces) {
      const baseKey = `${marketplace.toLowerCase()}:order:${slug}`;
      orderKeys.push(`${baseKey}:default`);
    }
  }

  const bidData = await Promise.all(
    orderKeys.map(async (key) => {
      const [value, ttl] = await Promise.all([redis.get(key), redis.ttl(key)]);

      const keyArray = key.split(":");

      const marketplace = keyArray[0];
      let identifier;

      if (bidType === "TOKEN") {
        identifier = keyArray[keyArray.length - 1];
      } else if (bidType === "COLLECTION") {
        identifier = "default";
      } else if (marketplace === "opensea") {
        const [, type, value] = keyArray.slice(-3);
        identifier = { type, value };
      } else if (marketplace === "blur") {
        try {
          const jsonString = keyArray.slice(3).join(":");
          const unescapedString = jsonString
            .replace(/\\"/g, '"')
            .replace(/^"|"$/g, "");
          const parsedObject = JSON.parse(unescapedString);
          identifier = parsedObject;
        } catch (error) {
          console.error(`Error parsing Blur identifier:`, error);
          identifier = keyArray[keyArray.length - 1];
        }
      } else if (marketplace === "magiceden") {
        try {
          const jsonString = keyArray.slice(3).join(":");
          identifier = JSON.parse(jsonString);
        } catch (error) {
          console.error(`Error parsing Magic Eden identifier:`, error);
          identifier = keyArray[keyArray.length - 1];
        }
      } else {
        identifier = keyArray[keyArray.length - 1];
      }

      let offerKey;
      if (bidType === "TOKEN") {
        if (marketplace.toLowerCase() === "blur") {
          offerKey = `${marketplace}:${slug}:collection`;
        } else {
          offerKey = `${marketplace}:${slug}:${identifier}`;
        }
      } else if (bidType === "COLLECTION") {
        offerKey = `${marketplace}:${slug}:collection`;
      } else {
        offerKey = `${marketplace}:${slug}:${
          identifier === "default" ? "collection" : JSON.stringify(identifier)
        }`;
      }
      const offerPrice = (await redis.get(offerKey)) || 0;

      return { key, value, ttl, marketplace, identifier, offerPrice };
    })
  );

  const bids = bidData.map((bid) => {
    const expirationDate = new Date(
      (currentTimestamp + bid.ttl) * 1000
    ).toISOString();
    if (bid.marketplace === "magiceden" && bid.value !== null) {
      const value = JSON.parse(bid.value);
      const orderId = value.orderId;
      return { ...bid, value: orderId, expirationDate };
    } else {
      return { ...bid, expirationDate };
    }
  });

  const offers = bids.filter((bid) => bid.ttl > 0);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(offers, { status: 200 });
}
