import { garnet, redstone } from "viem/chains";
import { supportedChains, validateChainName } from "../../../../../../../common";

const dozerUrl = {
  [garnet.id]: "https://dozer.mud.garnetchain.com/q",
  [redstone.id]: "https://dozer.redstone.xyz/q",
} as const;

export function getDozerUrl(chainName: string) {
  validateChainName(chainName);

  const chainId = supportedChains[chainName].id;
  if (!(chainId in dozerUrl)) {
    throw new Error(`Dozer URL not found for chain id ${chainId}`);
  }

  return dozerUrl[chainId as keyof typeof dozerUrl];
}
