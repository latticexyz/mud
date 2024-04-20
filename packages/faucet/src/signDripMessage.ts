import { Account, Client, Hex } from "viem";
import { signMessage } from "viem/actions";
import { getAction } from "viem/utils";
import { getDripMessage } from "./getDripMessage";

export type SignDripMessageParams = {
  client: Client;
  signMessagePrefix: string;
  account: Account;
  username: string;
};

export function signDripMessage({ client, account, username }: SignDripMessageParams): Promise<Hex> {
  return getAction(
    client,
    signMessage,
    "signMessage",
  )({ account, message: getDripMessage({ address: account.address, username }) });
}
