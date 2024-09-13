import { Chain, anvil, garnet, redstone } from "viem/chains";

// TODO: improve naming
export const chainsNamesMap = {
  [anvil.id]: "anvil",
  [garnet.id]: "garnet",
  [redstone.id]: "redstone",
};

// TODO: improve
export const namedChains: Partial<Record<string, Chain>> = {
  anvil: anvil,
  garnet: garnet,
  redstone: redstone,
};

export const chains: Partial<Record<number, Chain>> = {
  [anvil.id]: anvil,
  [garnet.id]: garnet,
  [redstone.id]: redstone,
};

export function getChain() {
  // TODO: handle differently, might need to be removed
  const chainId = Number(process.env.CHAIN_ID || anvil.id);
  const chain = chains[chainId];
  if (!chain) {
    throw new Error(`Chain ID ${chainId} not supported. Supported chains are: ${Object.keys(chains).join(", ")}.`);
  }

  return chain;
}

export function isAnvil() {
  const chain = getChain();
  return chain.id === anvil.id;
}
