import { redstone as redstoneConfig } from "viem/chains";
import type { MUDChain } from "./types";

export const redstone = {
  ...redstoneConfig,
  iconUrls: ["https://redstone.xyz/chain-icons/redstone.png"],
  indexerUrl: "https://indexer.mud.redstonechain.com",
} as const satisfies MUDChain;
