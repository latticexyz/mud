import { anvil, garnet, redstone } from "viem/chains";
import { useChain } from "./useChain";

const dozerUrl = {
  [garnet.id]: "https://indexer.mud.garnetchain.com/q",
  [redstone.id]: "https://indexer.mud.redstone.xyz/q",
} as const;

export function useIndexerApiUrl() {
  const { id: chainId } = useChain();
  if (chainId === anvil.id) {
    return "/api/sqlite-indexer";
  }

  if (!(chainId in dozerUrl)) {
    throw new Error(`Dozer URL not found for chain id ${chainId}`);
  }
  return dozerUrl[chainId as keyof typeof dozerUrl];
}
