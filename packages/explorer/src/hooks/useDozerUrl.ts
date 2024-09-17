import { garnet, redstone } from "viem/chains";
import { useChain } from "./useChain";

export const dozerUrl = {
  [garnet.id]: "https://dozer.mud.garnetchain.com/q",
  [redstone.id]: "https://dozer.redstone.xyz/q",
} as const;

export function useDozerUrl() {
  const { id: chainId } = useChain();
  if (!(chainId in dozerUrl)) {
    throw new Error(`Dozer URL not found for chain id ${chainId}`);
  }

  return dozerUrl[chainId as keyof typeof dozerUrl];
}
