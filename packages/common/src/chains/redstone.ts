import { redstone as redstoneConfig } from "viem/chains";
import type { MUDChain } from "./types";

export const redstone = {
  ...redstoneConfig,
  iconUrls: ["https://redstone.xyz/chain-icons/redstone.png"],
  indexerUrl: "https://indexer.mud.redstonechain.com",
  fees: {
    estimateFeesPerGas: async () => ({
      maxFeePerGas: 100_000n,
      maxPriorityFeePerGas: 0n,
    }),
  },
} as const satisfies MUDChain;
