import { validateChainId } from "../../../common";

export function indexerForChainId(chainId: number): { type: "sqlite" | "hosted"; url: string } {
  validateChainId(chainId);

  return { type: "hosted", url: new URL("/q", "http://0.0.0.0:8000").toString() };

  // if (chainId === anvil.id) {
  //   return { type: "sqlite", url: "/api/sqlite-indexer" };
  // }

  // const chainName = chainIdToName[chainId];
  // const chain = supportedChains[chainName] as MUDChain;
  // return { type: "hosted", url: new URL("/q", chain.indexerUrl).toString() };
}
