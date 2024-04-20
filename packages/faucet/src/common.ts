import { TwitterApiReadOnly } from "twitter-api-v2";
import { Account, Client } from "viem";

export type FaucetContext = {
  faucetClient: Client;
  faucetAccount: Account;
  dripAmount: bigint;
  postContentPrefix: string;
  xApi: TwitterApiReadOnly | null;
};

export const encodedSignatureLength = 214;
export const tweetMaxLength = 280;
