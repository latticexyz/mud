import { env } from "next-runtime-env";
import { Chain, defineChain } from "viem";
import { anvil } from "viem/chains";
import { garnet, redstone, rhodolite } from "@latticexyz/common/chains";

export const internalNamespaces = ["world", "store", "metadata", "puppet", "erc20-puppet", "erc721-puppet"];

export const constructCustomChain = (): Chain | null => {
  const chainId = env("NEXT_PUBLIC_CHAIN_ID");
  const chainName = env("NEXT_PUBLIC_CHAIN_NAME");
  const rpcHttpUrl = env("NEXT_PUBLIC_RPC_HTTP_URL");
  const rpcWsUrl = env("NEXT_PUBLIC_RPC_WS_URL");

  if (!chainId || !chainName || !rpcHttpUrl) {
    return null;
  }

  return defineChain({
    id: Number(chainId),
    name: chainName,
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [rpcHttpUrl],
        ...(rpcWsUrl ? { webSocket: [rpcWsUrl] } : {}),
      },
    },
  });
};

export const customChain = constructCustomChain();

export const supportedChains = {
  anvil,
  rhodolite,
  garnet,
  redstone,
} as const;

export type supportedChains = typeof supportedChains;
export type supportedChainName = keyof supportedChains;
export type supportedChainId = supportedChains[supportedChainName]["id"];

export const getChain = (chainName: supportedChainName | string) => {
  if (chainName === customChain?.name) {
    return customChain;
  } else if (chainName in supportedChains) {
    // @ts-expect-error ignore for now TODO: fix types
    return supportedChains[chainName];
  }
  return null;
};

export const chainIdToName = Object.fromEntries(
  Object.entries(supportedChains).map(([chainName, chain]) => [chain.id, chainName]),
) as Record<supportedChainId, supportedChainName>;

export function isValidChainId(chainId: unknown): chainId is supportedChainId | number {
  return typeof chainId === "number" && (chainId in chainIdToName || customChain?.id === chainId);
}

export function isValidChainName(name: unknown): name is supportedChainName | string {
  return typeof name === "string" && (name in supportedChains || customChain?.name === name);
}

export function validateChainId(chainId: unknown): asserts chainId is supportedChainId {
  if (!isValidChainId(chainId)) {
    const supportedIds = Object.keys(chainIdToName);
    throw new Error(`Invalid chain ID. Supported chains are: ${supportedIds.join(", ")}.`);
  }
}

export function validateChainName(name: unknown): asserts name is supportedChainName | string {
  if (!isValidChainName(name)) {
    const supportedNames = Object.keys(supportedChains);
    throw new Error(`Invalid chain name. Supported chains are: ${supportedNames.join(", ")}.`);
  }
}
