import { Chain, anvil, garnet, redstone } from "viem/chains";

export const chains: Record<number, Chain> = {
  [anvil.id]: anvil,
  [redstone.id]: redstone,
  [garnet.id]: garnet,
};

export function getChain() {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || anvil.id);
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
