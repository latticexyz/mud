import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";
import { useChains, useConfig as useWagmiConfig } from "wagmi";
import { getBalance } from "wagmi/actions";

export type UseChainBalancesOptions = {
  address: Hex;
};

export function useChainBalances({ address }: UseChainBalancesOptions) {
  const wagmiConfig = useWagmiConfig();
  const chains = useChains();
  const chainIds = chains.map((chain) => chain.id);
  return useQuery({
    queryKey: ["chainBalances", chainIds],
    queryFn: async () => {
      return await Promise.all(chains.map(async (chain) => getBalance(wagmiConfig, { chainId: chain.id, address })));
    },
    // TODO: allow customizing this?
    refetchInterval: 1000 * 60,
  });
}
