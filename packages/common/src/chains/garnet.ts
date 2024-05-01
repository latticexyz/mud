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
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
    },
    portal: {
      [sourceId]: {
        address: "0x57ee40586fbE286AfC75E67cb69511A6D9aF5909",
        blockCreated: 1274684,
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: "0xCb8E7AC561b8EF04F2a15865e9fbc0766FEF569B",
        blockCreated: 1274684,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0x09bcDd311FE398F80a78BE37E489f5D440DB95DE",
        blockCreated: 1274684,
      },
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/garnet.png"],
  indexerUrl: "https://indexer.mud.garnetchain.com",
} as const satisfies MUDChain;
