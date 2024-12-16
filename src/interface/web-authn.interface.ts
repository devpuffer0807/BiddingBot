import { Hex } from "viem";

export interface CreateCredential {
  rawId: Hex;
  pubKey: {
    x: Hex;
    y: Hex;
  };
}

export interface P256Credential {
  rawId: Hex;
  clientData: {
    type: string;
    challenge: string;
    origin: string;
    crossOrigin: boolean;
  };
  authenticatorData: Hex;
  signature: P256Signature;
}

export interface P256Signature {
  r: Hex;
  s: Hex;
}
