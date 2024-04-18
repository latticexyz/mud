import { foundry } from "viem/chains";
import { MUDChain } from "./types";

export const mudFoundry = {
  ...foundry,
  fees: {
    defaultPriorityFee: 0n,
  },
  rpcUrls: {
    ...foundry.rpcUrls,
    erc4337Bundler: {
      http: ["http://127.0.0.1:4337"],
    },
  },
  contracts: {
    ...foundry.contracts,
    gasTank: {
      address: "0x932c23946aba851829553ddd5e22d68b57a81f0d",
    },
  },
} as const satisfies MUDChain;
