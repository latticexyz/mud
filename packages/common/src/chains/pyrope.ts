import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";
import { Chain } from "viem";

const sourceId = 17000;

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
    quarryPassIssuer: defaultRpcUrls,
    wiresaw: defaultRpcUrls,
  },
  contracts: {
    ...chainConfig.contracts,
    l1StandardBridge: {
      [sourceId]: {
        address: "0x6487446e0B9FAEa90F6a9772A6448cFa780E30F9", // TODO: set correct address
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
