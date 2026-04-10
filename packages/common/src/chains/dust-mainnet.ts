import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";
import { Chain } from "viem";

const sourceId = 1;

const defaultRpcUrls = {
  http: ["https://rpc.dustproject.org"],
  webSocket: ["wss://rpc.dustproject.org"],
} as const satisfies Chain["rpcUrls"]["default"];

export const dustMainnet = {
  ...chainConfig,
  name: "DUST Mainnet",
  testnet: false,
  id: 55378,
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
        address: "0x74dc019e8ea61aca7e9136ac6d97047201776517",
      },
    },
    quarryPaymaster: {
      address: "0x0287Ec2e0750D09b34F4CF1b5Ac0Ea08d3dD19c1",
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.dustproject.org",
    },
    // worldsExplorer: {
    //   name: "MUD Worlds Explorer",
    //   url: "https://explorer.mud.dev/pyrope/worlds",
    // },
  },
  indexerUrl: "https://indexer.alpha.dustproject.org",
} as const satisfies MUDChain;
