import { foundry } from "viem/chains";
import { MUDChain } from "./types";

export const mudFoundry = {
  ...foundry,
  fees: {
    // This is intentionally defined as a function as a workaround for https://github.com/wagmi-dev/viem/pull/1280
    defaultPriorityFee: () => 0n,
  },
} as const satisfies MUDChain;
