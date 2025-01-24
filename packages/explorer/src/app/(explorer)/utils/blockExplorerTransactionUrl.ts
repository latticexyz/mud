import { Hex } from "viem";
import { chainIdToName, supportedChains, validateChainId } from "../../../common";

export function blockExplorerTransactionUrl({
  hash,
  chainId,
}: {
  hash: Hex | undefined;
  chainId: number;
}): string | undefined {
  if (!hash) return undefined;
  validateChainId(chainId);

  const chainName = chainIdToName[chainId];
  const chain = supportedChains[chainName];
  const explorerUrl = "blockExplorers" in chain && chain.blockExplorers?.default.url;
  if (!explorerUrl) return undefined;
  return `${explorerUrl}/tx/${hash}`;
}
