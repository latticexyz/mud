import { Chain, anvil, garnet, redstone } from "viem/chains";

const supportedChains = [anvil, garnet, redstone];

export type SupportedChainIds = (typeof supportedChains)[number]["id"];
export type SupportedChainNames = "anvil" | "garnet" | "redstone";

export const chainIdName: Record<SupportedChainIds, string> = {
  [anvil.id]: "anvil",
  [garnet.id]: "garnet",
  [redstone.id]: "redstone",
} as const;

// TODO: construct dynamically TS
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

// TODO: remove entirely?
export function isAnvil(chainId: number) {
  return chainId === anvil.id;
}
