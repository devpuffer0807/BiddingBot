import { Address, Hex } from "viem";

export interface PublicKey {
  x: Hex;
  y: Hex;
}

export interface User {
  id: Hex;
  pubKey: PublicKey;
  account: Address;
  balance: number;
}
