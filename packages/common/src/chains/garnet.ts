import { garnet as garnetConfig } from "viem/chains";
import type { MUDChain } from "./types";

export const garnet = {
  ...garnetConfig,
  rpcUrls: {
    ...garnetConfig.rpcUrls,
    bundler: garnetConfig.rpcUrls.default,
  },
  contracts: {
    ...garnetConfig.contracts,
    quarryPaymaster: {
      address: "0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f",
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/garnet.png"],
  indexerUrl: "https://indexer.mud.garnetchain.com",
} as const satisfies MUDChain;
