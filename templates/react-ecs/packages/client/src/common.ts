import mudConfig from "contracts/mud.config";
import { chains } from "./wagmiConfig";
import { Chain, Hex } from "viem";

export const chainId = import.meta.env.CHAIN_ID;
export const worldAddress = import.meta.env.WORLD_ADDRESS;
export const startBlock = import.meta.env.START_BLOCK;

export const url = new URL(window.location.href);

export type Entity = Hex;
export type Direction = (typeof mudConfig.enums.Direction)[number];

export function getWorldAddress() {
  if (!worldAddress) {
    throw new Error("No world address configured. Is the world still deploying?");
  }
  return worldAddress;
}

export function getChain(): Chain {
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`No chain configured for chain ID ${chainId}.`);
  }
  return chain;
}
