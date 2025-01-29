import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";
import { Chain } from "viem";

const sourceId = 17000;

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
    l1StandardBridge: {
      [sourceId]: {
        address: "0x6487446e0B9FAEa90F6a9772A6448cFa780E30F9",
      },
    },
    quarryPaymaster: {
      address: "0x7ca1b85aca23fccf2fbac14c02b5e8a6432639b9",
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
} as const satisfies MUDChain;
