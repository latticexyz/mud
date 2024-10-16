import { anvil } from "viem/chains";
import { garnet, redstone, rhodolite } from "@latticexyz/common/chains";

export const internalNamespaces = ["world", "store", "metadata", "puppet", "erc20-puppet", "erc721-puppet"];

export const supportedChains = { anvil, rhodolite, garnet, redstone } as const;
export type supportedChains = typeof supportedChains;

export type supportedChainName = keyof supportedChains;
export type supportedChainId = supportedChains[supportedChainName]["id"];

export const chainIdToName = Object.fromEntries(
  Object.entries(supportedChains).map(([chainName, chain]) => [chain.id, chainName]),
) as Record<supportedChainId, supportedChainName>;

export function validateChainId(chainId: unknown): asserts chainId is supportedChainId {
  if (!(typeof chainId === "number" && chainId in chainIdToName)) {
    throw new Error(`Invalid chain ID. Supported chains are: ${Object.keys(chainIdToName).join(", ")}.`);
  }
}

export function validateChainName(name: unknown): asserts name is supportedChainName {
  if (!(typeof name === "string" && name in supportedChains)) {
    throw new Error(`Invalid chain name. Supported chains are: ${Object.keys(supportedChains).join(", ")}.`);
  }
}
