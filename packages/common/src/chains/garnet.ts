import { chainConfig } from "viem/op-stack";
import type { MUDChain } from "./types";

const sourceId = 17000; // Holesky

export const garnet = {
  ...chainConfig,
  id: 17069,
  sourceId,
  name: "Garnet Holesky",
  testnet: true,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.garnetchain.com"],
      webSocket: ["wss://rpc.garnetchain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnetchain.com",
    },
  },
  contracts: {
    portal: {
      [sourceId]: {
        address: "0x57ee40586fbE286AfC75E67cb69511A6D9aF5909",
      },
    },
  },
} as const satisfies MUDChain;
