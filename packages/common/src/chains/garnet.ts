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
      address: "0x0528104d96672dfdF47B92f809A32e7eA11Ee8d9",
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/garnet.png"],
  indexerUrl: "https://indexer.mud.garnetchain.com",
} as const satisfies MUDChain;
