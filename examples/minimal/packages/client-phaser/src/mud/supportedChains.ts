import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
import { foundry } from "viem/chains";

// If you are deploying to chains other than anvil or Lattice testnet, add them here
export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
