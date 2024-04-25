import { garnet, redstone } from "@latticexyz/common/chains";
import { base, baseSepolia, holesky, mainnet, optimism, optimismSepolia, sepolia } from "viem/chains";

export const chains = [
  mainnet,
  redstone,
  holesky,
  garnet,
  sepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
] as const;
