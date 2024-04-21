import { TwitterApiReadOnly } from "twitter-api-v2";
import { Account, Address, Client } from "viem";

export type FaucetContext = {
  faucetClient: Client;
  faucetAccount: Account;
  dripAmount: bigint;
  postContentPrefix: string;
  xApi: TwitterApiReadOnly | null;
  dripHistoryPath: string;
  dripHistory: DripHistory;
};

export type Drip = { username: string; address: Address; amount: string; timestamp: number };
export type DripHistory = Record<string, Drip[]>;

export const encodedSignatureLength = 214;
export const tweetMaxLength = 280;
