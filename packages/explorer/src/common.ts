import { Chain, anvil, garnet, redstone } from "viem/chains";

export const chains: Record<number, Chain> = {
  [anvil.id]: anvil,
  [redstone.id]: redstone,
  [garnet.id]: garnet,
};
export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || anvil.id);
export const isAnvil = chainId === anvil.id;
export const chain = chains[chainId as keyof typeof chains] as Chain;
