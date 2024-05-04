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
    ...chainConfig.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
    },
    portal: {
      [sourceId]: {
        address: "0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae",
        blockCreated: 19578329,
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: "0xa426A052f657AEEefc298b3B5c35a470e4739d69",
        blockCreated: 19578337,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69",
        blockCreated: 19578331,
      },
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/redstone.png"],
  indexerUrl: "https://indexer.mud.redstonechain.com",
} as const satisfies MUDChain;
