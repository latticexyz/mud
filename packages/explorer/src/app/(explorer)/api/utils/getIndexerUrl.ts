import { chainIdToName, supportedChainId, supportedChains } from "../../../../common";

export function getIndexerUrl(chainId: supportedChainId) {
  const chain = supportedChains[chainIdToName[chainId]];
  return process.env.INDEXER_URL ? process.env.INDEXER_URL : "indexerUrl" in chain ? chain.indexerUrl : undefined;
}
