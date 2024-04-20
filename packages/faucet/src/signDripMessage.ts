import { Account, Client, Hex } from "viem";
import { signMessage } from "viem/actions";
import { getAction } from "viem/utils";
import { getDripSignatureMessage } from "./getDripSignatureMessage";

export type SignDripMessageParams = {
  client: Client;
  postContentPrefix: string;
  account: Account;
  username: string;
};

export function signDripMessage({ client, account, username, postContentPrefix }: SignDripMessageParams): Promise<Hex> {
  return getAction(
    client,
    signMessage,
    "signMessage",
  )({ account, message: getDripSignatureMessage({ address: account.address, username, postContentPrefix }) });
}
