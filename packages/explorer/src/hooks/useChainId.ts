import { wagmiConfig } from "../app/(explorer)/Providers";

export type ChainId = (typeof wagmiConfig)["chains"][number]["id"];

export function useChainId(): ChainId {
  const envChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const chain = wagmiConfig.chains.find((chain) => chain.id === envChainId);
  if (!chain) {
    throw new Error(`Invalid chain ID. Supported chains: ${wagmiConfig.chains.map((chain) => chain.id).join(", ")}.`);
  }

  return chain.id;
}
