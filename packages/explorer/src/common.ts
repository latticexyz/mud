import { defineChain } from "viem";
import { anvil } from "viem/chains";
import { garnet, redstone, rhodolite } from "@latticexyz/common/chains";

export const OPChainA = defineChain({
  id: 901,
  name: "OPChainA",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:9545"],
      webSocket: ["ws://127.0.0.1:9545"],
    },
  },
});

export const OPChainB = defineChain({
  id: 902,
  name: "OPChainB",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:9546"],
      webSocket: ["ws://127.0.0.1:9546"],
    },
  },
});

export const internalNamespaces = ["world", "store", "metadata", "puppet", "erc20-puppet", "erc721-puppet"];

export const supportedChains = { anvil, rhodolite, garnet, redstone, OPChainA, OPChainB } as const;
export type supportedChains = typeof supportedChains;

export type supportedChainName = keyof supportedChains;
export type supportedChainId = supportedChains[supportedChainName]["id"];

export const chainIdToName = Object.fromEntries(
  Object.entries(supportedChains).map(([chainName, chain]) => [chain.id, chainName]),
) as Record<supportedChainId, supportedChainName>;

export function isValidChainId(chainId: unknown): chainId is supportedChainId {
  return typeof chainId === "number" && chainId in chainIdToName;
}

export function isValidChainName(name: unknown): name is supportedChainName {
  return typeof name === "string" && name in supportedChains;
}

export function validateChainId(chainId: unknown): asserts chainId is supportedChainId {
  if (!isValidChainId(chainId)) {
    throw new Error(`Invalid chain ID. Supported chains are: ${Object.keys(chainIdToName).join(", ")}.`);
  }
}

export function validateChainName(name: unknown): asserts name is supportedChainName {
  if (!isValidChainName(name)) {
    throw new Error(`Invalid chain name. Supported chains are: ${Object.keys(supportedChains).join(", ")}.`);
  }
}
