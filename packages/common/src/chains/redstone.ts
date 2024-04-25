import { chainConfig } from "viem/op-stack";
import { mainnet } from "viem/chains";
import type { MUDChain } from "./types";

const sourceId = mainnet.id;

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
      url: "https://explorer.redstonechain.com",
    },
  },
  contracts: {
    portal: {
      [sourceId]: {
        // TODO
        address: "0x",
      },
    },
  },
} as const satisfies MUDChain;
