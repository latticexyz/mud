import { BlockTag, Client, Hex, getAddress } from "viem";
import { getChainId } from "viem/actions";

export async function getNonceManagerId({
  client,
  address,
  blockTag,
}: {
  client: Client;
  address: Hex;
  blockTag: BlockTag;
}): Promise<string> {
  // TODO: improve this so we don't have to call getChainId every time
  const chainId = client.chain?.id ?? (await getChainId(client));
  return `mud:createNonceManager:${chainId}:${getAddress(address)}:${blockTag}`;
}
