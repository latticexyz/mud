import { chainIdToName, supportedChainId, supportedChains } from "../../../../common";

export function getIndexerUrl(chainId: supportedChainId) {
  const chain = supportedChains[chainIdToName[chainId]];
  return "indexerUrl" in chain ? chain.indexerUrl : undefined;
}
