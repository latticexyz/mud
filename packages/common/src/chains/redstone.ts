import { chainConfig } from "viem/op-stack";
import type { MUDChain } from "./types";

const sourceId = 1; // Ethereum mainnet

export const redstone = {
  ...chainConfig,
  id: 690,
  sourceId,
  name: "Redstone",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.redstonechain.com"],
      webSocket: ["wss://rpc.redstonechain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.redstone.xyz",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/redstone.png"],
  indexerUrl: "https://indexer.mud.redstonechain.com",
} as const satisfies MUDChain;
