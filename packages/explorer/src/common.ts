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

export function isValidChainId(chainId: number): chainId is SupportedChainIds {
  return chainId in chainIdName;
}

export function isValidChainName(name: string | string[] | undefined): name is SupportedChainNames {
  if (Array.isArray(name)) {
    return false;
  }

  return typeof name === "string" && name in chainNameId;
}
