import axios from "axios";
import { ethers, Wallet as Web3Wallet } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import PQueue from "p-queue"; // Import PQueue

const API_KEY = "d3348c68-097d-48b5-b5f0-0313cc05e92d";
const ALCHEMY_API_KEY = "HGWgCONolXMB2op5UjPH1YreDCwmSbvx";

const queue = new PQueue({ concurrency: 8 });

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug") as string;
    const apiUrl: string = `https://api.nfttools.website/opensea/api/v2/collections/${slug?.toLowerCase()}`;

    const response = await queue.add(() =>
      fetch(apiUrl, {
        headers: { "X-NFT-API-Key": API_KEY },
      })
    );

    if (!response.ok) {
      throw new Error("Failed to fetch collection data");
    }

    const collection: CollectionData = await response.json();

    const [traits, blurFLoorPrice, magicedenFloorPrice, openseaFloorPrice] =
      await Promise.all([
        queue.add(() => getCollectionTraits(slug)),
        queue.add(() => fetchBlurFloorPrice(slug)),
        queue.add(() => fetchMagicEdenData(collection.contracts[0].address)),
        queue.add(() => fetchOpenSeaCollectionStats(slug)),
      ]);

    await fetchOpenSeaCollectionStats(slug);
    const data = {
      ...collection,
      traits,
      magicEdenValid: Number(magicedenFloorPrice) > 0,
      blurValid: Number(blurFLoorPrice) > 0,
      blurFLoorPrice,
      magicedenFloorPrice,
      openseaFloorPrice,
    };

    console.log({ blurFLoorPrice, magicedenFloorPrice, openseaFloorPrice });

    if (
      collection.total_supply > 0 &&
      collection.contracts[0].chain.toLowerCase() === "ethereum"
    ) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Collection offers not enabled" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function fetchOpenSeaCollectionStats(collectionSlug: string) {
  const url = `https://api.nfttools.website/opensea/api/v2/collections/${collectionSlug}/stats`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "X-NFT-API-Key": API_KEY,
      },
    });
    return +data.total.floor_price;
  } catch (error) {
    console.error("Error fetching OpenSea collection stats:", error);

    return 0;
  }
}

export async function fetchMagicEdenData(collectionId: string) {
  const API_KEY = "a4eae399-f135-4627-829a-18435bb631ae";

  const url = `https://nfttools.pro/magiceden_stats/collection_stats/stats?chain=ethereum&collectionId=${collectionId}`;

  try {
    const { data } = await axios.get<MagicEdenCollection>(url, {
      headers: {
        accept: "application/json",
        "X-NFT-API-Key": API_KEY,
      },
    });
    return +data.floorPrice.amount;
  } catch (error: any) {
    console.error("Error fetching Magic Eden data:", error.response.data);
    return 0;
  }
}

export async function fetchBlurFloorPrice(collectionSlug: string) {
  const apiUrl = `https://api.nfttools.website/blur/v1/collections/${collectionSlug}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json",
        "X-NFT-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data: BlurFloorPriceResponse = await response.json();
    return +data.collection.floorPrice.amount;
  } catch (error) {
    console.error("Error fetching BLUR floor price:", error);
    throw error;
  }
}

export async function getCollectionTraits(collectionSlug: string) {
  try {
    const response = await fetch(
      `https://api.nfttools.website/opensea/api/v2/traits/${collectionSlug}`,
      {
        headers: {
          accept: "application/json",
          "X-NFT-API-Key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      return { categories: {}, counts: {} };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collection traits:", error);
    throw error;
  }
}

export async function getAccessToken(
  url: string,
  private_key: string
): Promise<string | undefined> {
  const provider = new ethers.AlchemyProvider("mainnet", ALCHEMY_API_KEY);
  const wallet = new Web3Wallet(private_key, provider);
  const options = { walletAddress: wallet.address };

  const headers = {
    "content-type": "application/json",
    "X-NFT-API-Key": API_KEY,
  };

  try {
    let response: any = await axios.post(`${url}/auth/challenge`, options, {
      headers,
    });

    const message = response.data.message;
    const signature = await wallet.signMessage(message);
    const data = {
      message: message,
      walletAddress: wallet.address,
      expiresOn: response.data.expiresOn,
      hmac: response.data.hmac,
      signature: signature,
    };

    response = await axios.post(`${url}/auth/login`, data, { headers });

    return response.data.accessToken;
  } catch (error: any) {
    console.error(
      "getAccessToken Error:",
      error.response?.data || error.message
    );
  }
}

export interface CollectionData {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: string;
  safelist_status: string;
  category: string;
  is_disabled: boolean;
  is_nsfw: boolean;
  trait_offers_enabled: boolean;
  collection_offers_enabled: boolean;
  opensea_url: string;
  project_url: string;
  wiki_url: string;
  discord_url: string;
  telegram_url: string;
  twitter_username: string;
  instagram_username: string;
  contracts: {
    address: string;
    chain: string;
  }[];
  editors: string[];
  fees: {
    fee: number;
    recipient: string;
    required: boolean;
  }[];
  payment_tokens: {
    symbol: string;
    address: string;
    chain: string;
    image: string;
    name: string;
    decimals: number;
    eth_price: string;
    usd_price: string;
  }[];
  total_supply: number;
  created_date: string;
}

export interface BlurFloorPriceResponse {
  success: boolean;
  collection: {
    contractAddress: string;
    name: string;
    collectionSlug: string;
    imageUrl: string;
    totalSupply: number;
    numberOwners: number;
    floorPrice: {
      amount: string;
      unit: string;
    };
    floorPriceOneDay: {
      amount: string;
      unit: string;
    };
    floorPriceOneWeek: {
      amount: string;
      unit: string;
    };
    volumeFifteenMinutes: null | number;
    volumeOneDay: {
      amount: string;
      unit: string;
    };
    volumeOneWeek: {
      amount: string;
      unit: string;
    };
    bestCollectionBid: {
      amount: string;
      unit: string;
    };
    totalCollectionBidValue: {
      amount: string;
      unit: string;
    };
    traitFrequencies: Record<string, any>;
    bestCollectionLoanOffer: null;
  };
}

// ... existing code ...
interface MagicEdenCollection {
  collectionId: string;
  chain: string;
  collectionSymbol: string;
  contract: string;
  image: string;
  isVerified: boolean;
  listedCount: number;
  ownerCount: number;
  tokenCount: string;
  floorPrice: {
    amount: number;
    currency: string;
    native: number;
  };
  topOffer: {
    amount: number;
    currency: string;
    native: number;
  };
  totalVol: number;
  volume10m: number;
  volume1h: number;
  volume6h: number;
  volume24hr: number;
  volume7d: number;
  volume30d: number;
  avgPrice24hr: number;
  avgPrice7d: number;
  avgPrice30d: number;
  txns10m: number;
  txns1h: number;
  txns6h: number;
  txns24hr: number;
  txns7d: number;
  txns30d: number;
  deltaFloor24hr: number;
  deltaFloor7d: number;
  deltaFloor30d: number;
}
