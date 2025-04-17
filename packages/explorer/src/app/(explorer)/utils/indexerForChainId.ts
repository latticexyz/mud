import { anvil } from "viem/chains";
import { MUDChain } from "@latticexyz/common/chains";
import { chainIdToName, supportedChains, validateChainId } from "../../../common";

export function indexerForChainId(chainId: number): { type: "sqlite" | "hosted"; url: string } {
  validateChainId(chainId);

  if (chainId === anvil.id) {
    return {
      type: "sqlite",
      url: new URL("/q", `http://localhost:${process.env.NEXT_PUBLIC_INDEXER_PORT}`).toString(),
    };
  }

  const chainName = chainIdToName[chainId];
  const chain = supportedChains[chainName] as MUDChain;
  return { type: "hosted", url: new URL("/q", chain.indexerUrl).toString() };
}
