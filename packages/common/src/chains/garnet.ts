import { holesky } from "viem/chains";
import type { MUDChain } from "./types";

export const garnet = {
  id: 17069,
  sourceId: holesky.id,
  name: "Garnet",
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
} as const satisfies MUDChain;
