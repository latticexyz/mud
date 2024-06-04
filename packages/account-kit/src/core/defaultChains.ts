import { garnet, redstone } from "@latticexyz/common/chains";
import { base, baseSepolia, holesky, mainnet, optimism, optimismSepolia, sepolia } from "wagmi/chains";

// TODO: include relay chains
// TODO: figure out how to include foundry without console errors when not running foundry (can't use env since its a remote script)

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
