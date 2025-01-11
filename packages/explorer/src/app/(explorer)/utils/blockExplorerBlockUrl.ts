import { chainIdToName, supportedChains, validateChainId } from "../../../common";

export function blockExplorerBlockUrl({
  blockNumber,
  chainId,
}: {
  blockNumber: bigint;
  chainId: number;
}): string | undefined {
  if (!blockNumber) return undefined;
  validateChainId(chainId);

  const chainName = chainIdToName[chainId];
  const chain = supportedChains[chainName];
  const explorerUrl = "blockExplorers" in chain && chain.blockExplorers?.default.url;
  if (!explorerUrl) return undefined;
  return `${explorerUrl}/block/${blockNumber.toString()}`;
}
