import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";
import { Chain } from "viem";

const sourceId = 11155111;

const defaultRpcUrls = {
  http: ["https://rpc.pyropechain.com"],
  webSocket: ["wss://rpc.pyropechain.com"],
} as const satisfies Chain["rpcUrls"]["default"];

export const pyrope = {
  ...chainConfig,
  name: "Pyrope Testnet",
  testnet: true,
  id: 695569,
  sourceId,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: defaultRpcUrls,
    bundler: defaultRpcUrls,
  },
  contracts: {
    ...chainConfig.contracts,
    l1StandardBridge: {
      [sourceId]: {
        address: "0xC24932c31D9621aE9e792576152B7ef010cFC2F8",
      },
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.pyropechain.com",
    },
    worldsExplorer: {
      name: "MUD Worlds Explorer",
      url: "https://explorer.mud.dev/pyrope/worlds",
    },
  },
  iconUrls: ["https://lattice.xyz/brand/color/pyrope.svg"],
  indexerUrl: "https://indexer.mud.pyropechain.com",
} as const satisfies MUDChain;
