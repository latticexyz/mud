import { garnet, redstone } from "@latticexyz/common/chains";
import { base, baseSepolia, holesky, mainnet, optimism, optimismSepolia, sepolia } from "wagmi/chains";

export const defaultChains = [
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
