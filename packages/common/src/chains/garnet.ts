import { garnet as garnetConfig } from "viem/chains";
import type { MUDChain } from "./types";

export const garnet = {
  ...garnetConfig,
  iconUrls: ["https://redstone.xyz/chain-icons/garnet.png"],
  indexerUrl: "https://indexer.mud.garnetchain.com",
  fees: {
    estimateFeesPerGas: async () => ({
      maxFeePerGas: 100_000n,
      maxPriorityFeePerGas: 0n,
    }),
  },
} as const satisfies MUDChain;
