import type { MUDChain } from "./types";

export const hackathonTestnet = {
  name: "Hackathon Testnet",
  id: 16464,
  network: "hackathon-testnet",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://lattice-goerli-sequencer.optimism.io"],
      webSocket: ["wss://lattice-goerli-sequencer.optimism.io"],
    },
    public: {
      http: ["https://lattice-goerli-sequencer.optimism.io"],
      webSocket: ["wss://lattice-goerli-sequencer.optimism.io"],
    },
  },
  // modeUrl: "https://mode.testnet-mud-services.linfra.xyz",
  // faucetUrl: "https://faucet.testnet-mud-services.linfra.xyz",
} as const satisfies MUDChain;
