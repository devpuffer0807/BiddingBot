import axios from "axios";
import { ethers, Wallet as Web3Wallet } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import PQueue from "p-queue";

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
    const [
      openseaTraits,
      blurFLoorPrice,
      magicedenFloorPrice,
      openseaFloorPrice,
      blurTraits,
      magicEdenTraits,
    ] = await Promise.all([
      queue.add(() => getOpenseaTraits(slug)),
      queue.add(() => fetchBlurFloorPrice(slug)),
      queue.add(() => fetchMagicEdenData(collection.contracts[0].address)),
      queue.add(() => fetchOpenSeaCollectionStats(slug)),
      queue.add(() => fetchBlurTraits(collection.contracts[0].address)),
      queue.add(() =>
        fetchMagicEdenAttributes(collection.contracts[0].address)
      ),
    ]);

    const combinedTraits: {
      categories: Record<string, string>;
      counts: Record<
        string,
        Record<
          string,
          {
            count: number;
            availableInMarketplaces: string[];
          }
        >
      >;
    } = {
      categories: {},
      counts: {},
    };

    const marketplaces = ["opensea", "magiceden", "blur"] as const;
    const traitsData = [openseaTraits, magicEdenTraits, blurTraits];

    marketplaces.forEach((marketplace, index) => {
      const traits = traitsData[index];

      Object.entries(traits.categories).forEach(([category]) => {
        if (!combinedTraits.categories[category]) {
          combinedTraits.categories[category] = "string";
        }
        if (!combinedTraits.counts[category]) {
          combinedTraits.counts[category] = {};
        }

        Object.entries(traits.counts[category]).forEach(([trait, count]) => {
          if (!combinedTraits.counts[category][trait]) {
            combinedTraits.counts[category][trait] = {
              count: 0,
              availableInMarketplaces: [],
            };
          }

          if (
            typeof count === "number" &&
            count > combinedTraits.counts[category][trait].count
          ) {
            combinedTraits.counts[category][trait].count = count;
          }

          if (
            !combinedTraits.counts[category][
              trait
            ].availableInMarketplaces.includes(marketplace)
          ) {
            combinedTraits.counts[category][trait].availableInMarketplaces.push(
              marketplace
            );
          }
        });
      });
    });
    await fetchOpenSeaCollectionStats(slug);
    const data = {
      ...collection,
      traits: combinedTraits,
      magicEdenValid: Number(magicedenFloorPrice) > 0,
      blurValid: Number(blurFLoorPrice) > 0,
      blurFLoorPrice,
      magicedenFloorPrice,
      openseaFloorPrice,
    };
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

export async function getOpenseaTraits(collectionSlug: string) {
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
    return { categories: {}, counts: {} };
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

export async function fetchBlurTraits(contractAddress: string) {
  const url = `https://api.nfttools.website/blur/v1/traits/${contractAddress}`;
  try {
    const { data } = await axios.get<BlurCollectionTraitsResponse>(url, {
      headers: {
        "X-NFT-API-Key": API_KEY,
      },
    });
    const traits = transformBlurTraits(data.traits);
    return traits;
  } catch (error) {
    console.error("Error fetching BLUR traits:", error);
    return { categories: {}, counts: {} };
  }
}

export async function fetchMagicEdenAttributes(collectionId: string) {
  const url = `https://api.nfttools.website/magiceden/v3/rtp/ethereum/collections/${collectionId}/attributes/all/v4`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        accept: "application/json",
        "X-NFT-API-Key": API_KEY,
      },
    });

    const traits = transformMagicEdenTraits(data);
    return traits;
  } catch (error) {
    console.error("Error fetching Magic Eden attributes:", error);
    return { categories: {}, counts: {} };
  }
}

function transformMagicEdenTraits(magicEdenTraits: MagicEdenTraits): Traits {
  const traits: Traits = {
    categories: {},
    counts: {},
  };

  magicEdenTraits.attributes.forEach((attribute) => {
    const { key, values } = attribute;
    traits.categories[key] = "string";
    traits.counts[key] = {};
    values.forEach((value) => {
      const { value: itemValue, count } = value;
      traits.counts[key][itemValue] = count;
    });
  });

  return traits;
}

function transformBlurTraits(
  blurTraits: Record<string, Record<string, any>>
): Traits {
  const traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  } = {
    categories: {},
    counts: {},
  };
  for (const category in blurTraits) {
    traits.categories[category] = "string";
    traits.counts[category] = {};
    for (const item in blurTraits[category]) {
      traits.counts[category][item] = 0;
    }
  }
  return traits;
}

type MagicEdenValue = {
  count: number;
  value: string;
  floorAskPrice?: {
    currency: {
      contract: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    amount: {
      raw: string;
      decimal: number;
      usd: number;
      native: number;
    };
  };
};

type MagicEdenAttribute = {
  key: string;
  attributeCount: number;
  kind: string;
  values: MagicEdenValue[];
};

type MagicEdenTraits = {
  attributes: MagicEdenAttribute[];
};

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

interface BlurTraitData {
  sale: {
    amount: string;
    unit: string;
    listedAt: string;
  };
  floor: {
    amount: string;
    unit: string;
    listedAt: string;
  };
  bestBidPrice: string | null;
  totalBidValue: string | null;
}

interface BlurTraits {
  [category: string]: {
    [trait: string]: BlurTraitData;
  };
}

interface BlurCollectionTraitsResponse {
  success: boolean;
  traits: BlurTraits;
}

interface Traits {
  categories: {
    [key: string]: string;
  };
  counts: {
    [key: string]: Record<string, number>;
  };
}
