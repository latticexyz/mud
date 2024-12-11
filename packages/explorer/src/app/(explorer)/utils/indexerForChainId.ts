import { anvil } from "viem/chains";
import { MUDChain } from "@latticexyz/common/chains";
import { chainIdToName, supportedChains, validateChainId } from "../../../common";

export function indexerForChainId(chainId: number): { type: "sqlite" | "hosted"; url: string } {
  validateChainId(chainId);

  if (chainId === anvil.id) {
    return { type: "sqlite", url: "/api/sqlite-indexer" };
  }

  // TODO: improve logic
  const chainName = chainIdToName[chainId];
  if (!chainName) {
    return { type: "sqlite", url: "/api/sqlite-indexer" };
  }

  const chain = supportedChains[chainName] as MUDChain;
  return { type: "hosted", url: new URL("/q", chain.indexerUrl).toString() };
}
