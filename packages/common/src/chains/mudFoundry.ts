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
  contracts: {
    ...foundry.contracts,
    gasTank: {
      address: "0x9453321e3bece7caa1a65ed2df1304d9aed13a72",
    },
  },
} as const satisfies MUDChain;
