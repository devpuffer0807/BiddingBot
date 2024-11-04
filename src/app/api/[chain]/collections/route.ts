import axios from "axios";
import { ethers, Wallet as Web3Wallet } from "ethers";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = "d3348c68-097d-48b5-b5f0-0313cc05e92d";
const ALCHEMY_API_KEY = "0rk2kbu11E5PDyaUqX1JjrNKwG7s4ty5";
const GOLD = "\x1b[33m";
export const RESET = "\x1b[0m";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug") as string;
    const apiUrl: string = `https://api.nfttools.website/opensea/api/v2/collections/${slug?.toLowerCase()}`;
    const response = await fetch(apiUrl, {
      headers: { "X-NFT-API-Key": API_KEY },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch collection data");
    }
    const collection: CollectionData = await response.json();

    // Define all tasks
    const tasks = [
      getOpenseaTraits(slug),
      fetchBlurFloorPrice(slug),
      fetchMagicEdenData(collection.contracts[0].address),
      fetchOpenSeaCollectionStats(slug),
      fetchBlurTraits(collection.contracts[0].address),
      fetchMagicEdenAttributes(collection.contracts[0].address),
      fetchTraitData(slug),
      // fetchMagicEdenTokens(collection.contracts[0].address),
    ];

    const [
      openseaTraits,
      blurFLoorPrice,
      magicedenFloorPrice,
      openseaFloorPrice,
      blurTraits,
      magicEdenTraits,
      openseaTraitData,
    ] = await Promise.all(tasks);

    const combinedTraits: {
      categories: Record<string, string>;
      counts: Record<
        string,
        Record<
          string,
          {
            count: number;
            availableInMarketplaces: string[];
            magicedenFloor: number;
            blurFloor: number;
            openseaFloor: number;
          }
        >
      >;
    } = {
      categories: {},
      counts: {},
    };

    const marketplaces = ["opensea", "magiceden", "blur"] as const;
    const traitsData = [
      openseaTraits,
      magicEdenTraits.traits,
      blurTraits.traits,
    ];

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
              magicedenFloor: 0,
              blurFloor: 0,
              openseaFloor: 0,
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

          // Add Blur floor price
          if (
            marketplace === "blur" &&
            blurTraits.blurRaw?.traits &&
            blurTraits.blurRaw.traits[category]
          ) {
            const blurFloor =
              +blurTraits.blurRaw.traits[category][trait]?.floor?.amount || 0;
            combinedTraits.counts[category][trait].blurFloor = blurFloor;
          }

          // Add MagicEden floor price
          if (
            marketplace === "magiceden" &&
            magicEdenTraits?.magicedenRaw?.attributes
          ) {
            const magicEdenAttribute =
              magicEdenTraits.magicedenRaw.attributes.find(
                (attr: any) => attr.key === category
              );
            if (magicEdenAttribute) {
              const magicEdenValue = magicEdenAttribute.values.find(
                (value: any) => value.value === trait
              );
              if (magicEdenValue && magicEdenValue.floorAskPrice) {
                combinedTraits.counts[category][trait].magicedenFloor =
                  magicEdenValue?.floorAskPrice?.amount?.decimal;
              }
            }
          }

          // Update OpenSea floor price
          if (
            marketplace === "opensea" &&
            openseaTraitData?.data?.collection?.stringTraits
          ) {
            const openseaTrait =
              openseaTraitData.data.collection.stringTraits.find(
                (t: any) => t.key.toLowerCase() === category.toLowerCase()
              );
            if (openseaTrait) {
              const openseaValue = openseaTrait.counts.find(
                (c: any) => c.value.toLowerCase() === trait.toLowerCase()
              );
              if (openseaValue && openseaValue.floor) {
                combinedTraits.counts[category][trait].openseaFloor =
                  parseFloat(openseaValue.floor.eth);
              }
            }
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
  const url = `https://api.nfttools.website/magiceden_stats/collection_stats/stats?chain=ethereum&collectionId=${collectionId}`;

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

export async function fetchBlurTraits(contractAddress: string) {
  const url = `https://api.nfttools.website/blur/v1/traits/${contractAddress}`;
  try {
    const { data } = await axios.get<BlurCollectionTraitsResponse>(url, {
      headers: {
        "X-NFT-API-Key": API_KEY,
      },
    });
    const traits = transformBlurTraits(data.traits);
    return { traits, blurRaw: data };
  } catch (error) {
    console.error("Error fetching BLUR traits:", error);
    return { categories: {}, counts: {} };
  }
}

export async function fetchMagicEdenAttributes(collectionId: string) {
  const url = `https://api.nfttools.website/magiceden/v3/rtp/ethereum/collections/${collectionId}/attributes/all/v4`;
  try {
    const { data } = await axios.get<MagicEdenTraits>(url, {
      headers: {
        accept: "application/json",
        "X-NFT-API-Key": API_KEY,
      },
    });

    const traits = transformMagicEdenTraits(data);
    return { traits, magicedenRaw: data };
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

  try {
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
  } catch (error) {
    return { categories: {}, counts: {} };
  }
}

function transformBlurTraits(
  blurTraits: Record<string, Record<string, any>>
): Traits {
  try {
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
  } catch (error) {
    return { categories: {}, counts: {} };
  }
}

const fetchTraitData = async (collectionSlug: string) => {
  try {
    const data = {
      id: "TraitSelectorQuery",
      query:
        "query TraitSelectorQuery(\n  $collectionSlug: CollectionSlug\n  $withTraitFloor: Boolean\n) {\n  collection(collection: $collectionSlug) {\n    ...TraitSelector_data_4zPn1c\n    id\n  }\n}\n\nfragment TraitSelector_data_4zPn1c on CollectionType {\n  statsV2 {\n    totalSupply\n  }\n  stringTraits(withTraitFloor: $withTraitFloor) {\n    key\n    counts {\n      count\n      value\n      floor {\n        eth\n        unit\n        symbol\n        usd\n      }\n    }\n  }\n}\n",
      variables: {
        collectionSlug: collectionSlug,
        withTraitFloor: true,
      },
    };

    const { data: openseaTraits } = await axios.post<OpenseaTraits>(
      "https://api.nfttools.website/opensea/__api/graphql/",
      data,
      {
        headers: {
          "X-NFT-API-Key": API_KEY,
          "content-type": "application/json",
          "x-signed-query":
            "6ae240a98f748a2ecef0a71cb6424c3d47c9c62691ca07ebadf318bf7fcc9517",
        },
      }
    );
    return openseaTraits;
  } catch (error: any) {
    console.error("Error fetching trait data:", error.response.data.errors);
  }
};

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
interface OpenseaTraits {
  data: OpenseaData;
}

interface OpenseaData {
  collection: OpenseaCollection;
}

interface OpenseaCollection {
  statsV2: OpenseaStatsV2;
  stringTraits: OpenseaStringTrait[];
  id: string;
}

interface OpenseaStatsV2 {
  totalSupply: number;
}

interface OpenseaStringTrait {
  key: string;
  counts: OpenseaTraitCount[];
}

interface OpenseaTraitCount {
  count: number;
  value: string;
  floor: OpenseaFloor | null;
}

interface OpenseaFloor {
  eth: string;
  unit: string;
  symbol: string;
  usd: string;
}
