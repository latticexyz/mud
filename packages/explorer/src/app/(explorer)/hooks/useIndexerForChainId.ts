"use client";

import { anvil } from "viem/chains";
import { MUDChain } from "@latticexyz/common/chains";
import { chainIdToName, supportedChains, validateChainId } from "../../../common";
import { useIndexer } from "../providers/IndexerProvider";

export function useIndexerForChainId(chainId: number) {
  validateChainId(chainId);

  const { indexerPort } = useIndexer();

  if (chainId === anvil.id) {
    return {
      type: "sqlite" as const,
      url: new URL("/q", `http://localhost:${indexerPort}`).toString(),
    };
  }

  const chainName = chainIdToName[chainId];
  const chain = supportedChains[chainName] as MUDChain;
  return {
    type: "hosted" as const,
    url: new URL("/q", chain.indexerUrl).toString(),
  };
}
