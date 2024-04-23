import { garnet } from "@latticexyz/common/chains";
import { holesky, mainnet } from "viem/chains";

export const chains = [mainnet, holesky, garnet] as const;
