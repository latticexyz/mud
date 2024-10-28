import { Account, BlockTag, Client, getAddress } from "viem";
import { getChainId } from "viem/actions";
import { getAction } from "viem/utils";

export async function getNonceManagerId({
  client,
  account,
  blockTag,
}: {
  client: Client;
  account: Account;
  blockTag: BlockTag;
}): Promise<string> {
  // TODO: improve this so we don't have to call getChainId every time
  const chainId = client.chain?.id ?? (await getAction(client, getChainId, "getChainId")({}));
  return `mud:createNonceManager:${chainId}:${getAddress(account.address)}:${blockTag}`;
}
