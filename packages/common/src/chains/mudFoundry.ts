import { foundry } from "viem/chains";
import { MUDChain } from "./types";

export const mudFoundry = {
  ...foundry,
  // fees: {
  //   defaultPriorityFee: 0n,
  // },
} as const satisfies MUDChain;
