export interface BidData {
  id: string;
  kind: string;
  side: string;
  status: string;
  tokenSetId: string;
  tokenSetSchemaHash: string;
  nonce: string | null;
  contract: string;
  maker: string;
  taker: string;
  price: {
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
    netAmount: {
      raw: string;
      decimal: number;
      usd: number;
      native: number;
    };
  };
  validFrom: number;
  validUntil: number;
  quantityFilled: number;
  quantityRemaining: number;
  criteria: {
    kind: string;
    data: {
      collection: {
        id: string;
        name: string;
        image: string;
      };
    };
  };
  source: {
    id: string;
    domain: string;
    name: string;
    icon: string;
  };
  feeBps: number;
  feeBreakdown: {
    bps: number;
    kind: string;
    recipient: string;
  }[];
  expiration: number | null;
  isReservoir: boolean | null;
  isDynamic: boolean;
  createdAt: string;
  updatedAt: string;
  originatedAt: string | null;
  rawData: any;
}

export interface BidInfo {
  collectionSlug: string;
  basePrice: string;
  formattedPrice: string;
  expirationDate: string;
  paymentToken: {
    symbol: string;
    usdPrice: string;
  };
  makerAddress: string;
  quantity: number;
  marketplace: string;
  eventTimestamp: string;
}

export interface WebSocketResponse {
  event: string;
  changed: string[];
  data: BidData;
  tags: {
    contract: string;
    source: string;
    maker: string;
    taker: string;
  };
  published_at: number;
  event_id: string;
  type: string;
  status: string;
  me_metadata: {
    kafka_ts: number | null;
    wss_processor_ts: number;
  };
}
