import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";
import { Chain } from "viem";

const sourceId = 17001;

const defaultRpcUrls = {
  http: ["https://rpc.rhodolitechain.com"],
  webSocket: ["wss://rpc.rhodolitechain.com"],
} as const satisfies Chain["rpcUrls"]["default"];

export const rhodolite = {
  ...chainConfig,
  name: "Rhodolite Devnet",
  testnet: true,
  id: 17420,
  sourceId,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: defaultRpcUrls,
    bundler: defaultRpcUrls,
    quarryPassIssuer: defaultRpcUrls,
    wiresaw: defaultRpcUrls,
  },
  contracts: {
    ...chainConfig.contracts,
    quarryPaymaster: {
      address: "0x61f22c3827d90c390e0e2aaf220971524ac0a68d",
      blockCreated: 11262,
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.rhodolitechain.com",
    },
    worldsExplorer: {
      name: "MUD Worlds Explorer",
      url: "https://explorer.mud.dev/rhodolite/worlds",
    },
  },
  iconUrls: ["https://redstone.xyz/chain-icons/rhodolite.png"],
  indexerUrl: "https://indexer.mud.rhodolitechain.com",
  mudIdUrl: "https://id.mud.dev",
  fees: {
    estimateFeesPerGas: async () => ({
      maxFeePerGas: 100_000n,
      maxPriorityFeePerGas: 0n,
    }),
  },
} as const satisfies MUDChain;
