import type { MUDChain } from "./types";

/** @deprecated This chain is deprecated and will be going offline soon. Please switch to Garnet! */
export const latticeTestnet = {
  name: "Lattice Testnet",
  id: 4242,
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://follower.testnet-chain.linfra.xyz"],
      webSocket: ["wss://follower.testnet-chain.linfra.xyz"],
    },
    public: {
      http: ["https://follower.testnet-chain.linfra.xyz"],
      webSocket: ["wss://follower.testnet-chain.linfra.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Otterscan",
      url: "https://explorer.testnet-chain.linfra.xyz",
    },
  },
  faucetUrl: "https://faucet.testnet-mud-services.linfra.xyz",
} as const satisfies MUDChain;
