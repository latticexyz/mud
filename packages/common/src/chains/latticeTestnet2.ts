import type { MUDChain } from "./types";

export const latticeTestnet2 = {
  name: "Lattice Testnet 2",
  id: 4243,
  network: "lattice-testnet2",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://follower.testnet2-chain.linfra.xyz"],
      webSocket: ["wss://follower.testnet2-chain.linfra.xyz"],
    },
    public: {
      http: ["https://follower.testnet2-chain.linfra.xyz"],
      webSocket: ["wss://follower.testnet-chain.linfra.xyz"],
    },
  },
  blockExplorers: {
    otterscan: {
      name: "Otterscan",
      url: "https://explorer.testnet2-chain.linfra.xyz",
    },
    default: {
      name: "Otterscan",
      url: "https://explorer.testnet2-chain.linfra.xyz",
    },
  },
  modeUrl: undefined,
  faucetUrl: "https://faucet.testnet2-mud-services.linfra.xyz",
} as const satisfies MUDChain;
