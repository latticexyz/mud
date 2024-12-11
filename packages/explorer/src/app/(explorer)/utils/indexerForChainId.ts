import { anvil } from "viem/chains";
import { MUDChain } from "@latticexyz/common/chains";
import { chainIdToName, supportedChains, validateChainId } from "../../../common";

export function indexerForChainId(chainId: number): { type: "sqlite" | "hosted"; url: string } {
  // validateChainId(chainId);

  // TODO: || chainId === 901 || chainId === 902
  return { type: "sqlite", url: "/api/sqlite-indexer" };

  // if (chainId === anvil.id) {
  //   return { type: "sqlite", url: "/api/sqlite-indexer" };
  // }

  // const chainName = chainIdToName[chainId];
  // const chain = supportedChains[chainName] as MUDChain;
  // return { type: "hosted", url: new URL("/q", chain.indexerUrl).toString() };
}
