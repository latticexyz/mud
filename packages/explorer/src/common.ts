import { Chain, anvil, garnet, redstone } from "viem/chains";

const supportedChains = [anvil, garnet, redstone];

export type SupportedChainIds = (typeof supportedChains)[number]["id"];
export type SupportedChainNames = "anvil" | "garnet" | "redstone";

export const chainIdName: Record<SupportedChainIds, SupportedChainNames> = {
  [anvil.id]: "anvil",
  [garnet.id]: "garnet",
  [redstone.id]: "redstone",
} as const;

export const chainNameId: Record<SupportedChainNames, SupportedChainIds> = {
  anvil: anvil.id,
  garnet: garnet.id,
  redstone: redstone.id,
};

export const chains: Record<SupportedChainIds, Chain> = {
  [anvil.id]: anvil,
  [garnet.id]: garnet,
  [redstone.id]: redstone,
};

export function isValidChainId(chainId: number): asserts chainId is SupportedChainIds {
  if (!(chainId in chainIdName)) {
    throw new Error(`Invalid chain id. Supported chains are: ${Object.keys(chainIdName).join(", ")}.`);
  }
}

export function isValidChainName(name: string | string[] | undefined): asserts name is SupportedChainNames {
  if (Array.isArray(name) || typeof name !== "string" || !(name in chainNameId)) {
    throw new Error(`Invalid chain name. Supported chains are: ${Object.keys(chainNameId).join(", ")}.`);
  }
}
