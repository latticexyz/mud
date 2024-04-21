import { Account, Client, Hex } from "viem";
import { signMessage } from "viem/actions";
import { getDripSignatureMessage } from "./getDripSignatureMessage";

export type SignDripMessageParams = {
  client: Client;
  postContentPrefix: string;
  account: Account;
  username: string;
};

export function signDripMessage({ client, account, username, postContentPrefix }: SignDripMessageParams): Promise<Hex> {
  return signMessage(client, {
    account,
    message: getDripSignatureMessage({ address: account.address, username, postContentPrefix }),
  });
}
