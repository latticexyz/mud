import { Chain, anvil, garnet, redstone } from "viem/chains";

// TODO: can be improved?
export const chainNameId = {
  [anvil.id]: "anvil",
  [garnet.id]: "garnet",
  [redstone.id]: "redstone",
};

// TODO: improve
export const namedChains: Partial<Record<string, Chain>> = {
  [chainNameId[anvil.id]]: anvil,
  [chainNameId[garnet.id]]: garnet,
  [chainNameId[redstone.id]]: redstone,
};

export const chains: Partial<Record<number, Chain>> = {
  [anvil.id]: anvil,
  [garnet.id]: garnet,
  [redstone.id]: redstone,
};

export function isAnvil(chainId: number) {
  return chainId === anvil.id;
}
