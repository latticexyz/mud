import { BlockTag, Client, Hex, getAddress } from "viem";
import { getChainId } from "viem/actions";
import { getAction } from "viem/utils";

export async function getNonceManagerId({
  client,
  chainId: _chainId,
  address,
  blockTag,
}: {
  client: Client;
  chainId?: number;
  address: Hex;
  blockTag: BlockTag;
}): Promise<string> {
  const chainId = _chainId ?? client.chain?.id ?? (await getAction(client, getChainId, "getChainId")({}));
  return `mud:createNonceManager:${chainId}:${getAddress(address)}:${blockTag}`;
}
