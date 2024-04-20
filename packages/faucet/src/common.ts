import { WalletClient } from "viem";

export type FaucetContext = {
  client: WalletClient;
  dripAmount: bigint;
  signMessagePrefix: string;
};
