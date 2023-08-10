import { foundry } from "viem/chains";
import { MUDChain } from "./types";

export const mudFoundry = {
  ...foundry,
  // We may override chain settings here
} as const satisfies MUDChain;
