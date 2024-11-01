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
      // https://github.com/latticexyz/quarry-paymaster/blob/a8bb2f3630c086f91ec3c283fac555ac441899b3/packages/contracts/worlds.json#L3
      address: "0x37257e51a4a496bb921fb634c2cbe20e945e7da8",
      blockCreated: 301260,
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
