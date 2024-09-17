import { anvil, garnet, redstone } from "viem/chains";

export const supportedChains = { anvil, garnet, redstone } as const;
export const supportedChainsById = Object.fromEntries(
  Object.entries(supportedChains).map(([, chain]) => [chain.id, chain]),
);

export type SupportedChainIds = (typeof supportedChains)[keyof typeof supportedChains]["id"];
export type SupportedChainNames = keyof typeof supportedChains;

export function validateChainId(chainId: number): asserts chainId is SupportedChainIds {
  if (!(chainId in supportedChainsById)) {
    throw new Error(`Invalid chain id. Supported chains are: ${Object.keys(supportedChainsById).join(", ")}.`);
  }
}

export function validateChainName(name: string | string[] | undefined): asserts name is SupportedChainNames {
  if (Array.isArray(name) || typeof name !== "string" || !(name in supportedChains)) {
    throw new Error(`Invalid chain name. Supported chains are: ${Object.keys(supportedChainsById).join(", ")}.`);
  }
}
