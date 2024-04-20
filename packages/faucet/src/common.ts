import { Account, Client } from "viem";

export type FaucetContext = {
  client: Client;
  account: Account;
  dripAmount: bigint;
  signMessagePrefix: string;
};
