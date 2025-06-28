import { createClient, http } from "viem";
import { chainIdToName, supportedChainId, supportedChains } from "../../../../common";

export async function getClient(chainId: supportedChainId) {
  const chain = supportedChains[chainIdToName[chainId]];
  const client = createClient({
    chain,
    transport: http(),
  });

  return client;
}
