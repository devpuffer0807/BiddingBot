import Wallet from "@/models/wallet.model";
import { getUserIdFromCookies } from "@/utils";
import { connect } from "@/utils/mongodb";
import axios from "axios";
import { ethers, Wallet as Web3Wallet } from "ethers";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = "8a73f6c4-5f93-40fc-b50d-74d865b1cbf9";

export async function GET(
  request: NextRequest,
  { params }: { params: { chain: string } }
) {
  await connect();
  try {
    const { chain } = params;
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug") as string;

    let apiUrl: string;
    switch (chain.toLowerCase()) {
      case "ethereum":
        apiUrl = `https://api.nfttools.website/opensea/api/v2/collections/${slug?.toLowerCase()}`;
        break;
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }

    const response = await fetch(apiUrl, {
      headers: { "X-NFT-API-Key": API_KEY },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch collection data");
    }

    const collection: CollectionData = await response.json();

    let traits = null;
    try {
      traits = await getCollectionTraits(slug);
    } catch (error) {
      console.error("Error fetching traits:", error);
    }

    let magicEdenValid = false;
    let blurValid = false;
    try {
      // magicEdenValid = await checkMagicEden(collection.contracts[0].address);
    } catch (error) {
      console.error("Error checking Magic Eden:", error);
    }

    try {
      const userId = await getUserIdFromCookies(request);

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        return NextResponse.json(
          { error: "You need to create a wallet first" },
          { status: 400 }
        );
      }

      blurValid = await checkBlur(
        collection.contracts[0].address,
        wallet.address,
        wallet.privateKey
      );
    } catch (error) {
      console.error("Error checking Blur:", error);
    }

    console.log({ magicEdenValid, blurValid });

    const data = { ...collection, traits, magicEdenValid, blurValid };

    if (
      collection.collection_offers_enabled &&
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
      throw new Error("Failed to fetch collection traits");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collection traits:", error);
    throw error;
  }
}

async function checkMagicEden(contractAddress: string): Promise<boolean> {
  console.log({ contractAddress });

  const apiUrl = `https://api.nfttools.website/magiceden/v3/rtp/ethereum/collections/v7?id=${contractAddress}&displayCurrency=0x4200000000000000000000000000000000000006`;
  const headers = {
    accept: "application/json",
    "X-NFT-API-Key": API_KEY,
  };

  try {
    const response = await fetch(apiUrl, { headers });

    console.log({ response });

    if (!response.ok) {
      throw new Error("Failed to validate contract address on Magic Eden");
    }
    return true;
  } catch (error) {
    console.error("Error checking Magic Eden:", error);
    return false;
  }
}

async function checkBlur(
  contractAddress: string,
  walletAddress: string,
  private_key: string
): Promise<boolean> {
  const sanitizedPrivateKey = private_key.startsWith("0x")
    ? private_key.slice(2)
    : private_key;

  const BLUR_API_URL = "https://api.nfttools.website/blur";
  const accessToken = await getAccessToken(BLUR_API_URL, sanitizedPrivateKey);

  const options = {
    method: "GET",
    url: `${BLUR_API_URL}/v1/collections/${contractAddress}`,
    headers: {
      authToken: accessToken as string,
      walletAddress: walletAddress,
      "X-NFT-API-Key": API_KEY,
    },
  };

  try {
    const response = await axios.get(options.url, {
      headers: options.headers,
    });

    return response.data.success;
  } catch (error) {
    console.error("Error checking Blur:", error);
    return false;
  }
}

export async function getAccessToken(
  url: string,
  private_key: string
): Promise<string | undefined> {
  const provider = new ethers.AlchemyProvider(
    "mainnet",
    "0rk2kbu11E5PDyaUqX1JjrNKwG7s4ty5"
  );
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
