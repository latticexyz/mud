import { foundry } from "viem/chains";
import { MUDChain } from "./types";

export const mudFoundry = {
  ...foundry,
  erc4337BundlerUrl: {
    http: "http://127.0.0.1:4337",
  },
  fees: {
    // This is intentionally defined as a function as a workaround for https://github.com/wagmi-dev/viem/pull/1280
    defaultPriorityFee: () => 0n,
  },
} as const satisfies MUDChain;
