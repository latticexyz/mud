import { garnet as garnetConfig } from "viem/chains";
import type { MUDChain } from "./types";

export const garnet = {
  ...garnetConfig,
  iconUrls: ["https://redstone.xyz/chain-icons/garnet.png"],
  indexerUrl: "https://indexer.mud.garnetchain.com",
} as const satisfies MUDChain;
