import { chainConfig } from "viem/op-stack";
import { MUDChain } from "./types";
import { Chain } from "viem";

const sourceId = 11155111;

const defaultRpcUrls = {
  http: ["https://rpc-dust-testnet-0.t.conduit.xyz"],
  webSocket: ["wss://rpc-dust-testnet-0.t.conduit.xyz"],
} as const satisfies Chain["rpcUrls"]["default"];

export const dustTestnet = {
  ...chainConfig,
  name: "DUST Testnet",
  testnet: true,
  id: 55377,
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
        address: "0x2bf323a752ff9794576a5ea2fac902121e13bc3f",
      },
    },
    quarryPaymaster: {
      address: "0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f",
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer-dust-testnet-0.t.conduit.xyz/",
    },
    // worldsExplorer: {
    //   name: "MUD Worlds Explorer",
    //   url: "https://explorer.mud.dev/pyrope/worlds",
    // },
  },
  indexerUrl: "http://51.91.235.181:13690",
} as const satisfies MUDChain;
