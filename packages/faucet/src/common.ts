import { Account, Client } from "viem";

export type FaucetContext = {
  client: Client;
  account: Account;
  dripAmount: bigint;
  signMessagePrefix: string;
};

export const encodedSignatureLength = 214;
export const tweetMaxLength = 280;
