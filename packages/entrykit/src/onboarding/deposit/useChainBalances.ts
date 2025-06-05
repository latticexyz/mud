import { useQuery } from "@tanstack/react-query";
import { Address, Chain } from "viem";
import { useAccount, useConfig as useWagmiConfig } from "wagmi";
import { getBalance } from "wagmi/actions";

export type UseChainBalancesOptions = {
  chains: Chain[];
};

export function useChainBalances({ chains }: UseChainBalancesOptions) {
  const userAccount = useAccount();
  const wagmiConfig = useWagmiConfig();
  const chainIds = chains.map((chain) => chain.id);
  return useQuery({
    queryKey: ["chainBalances", chainIds],
    queryFn: async () => {
      const balances = await Promise.all(
        chains.map(async (chain) => {
          try {
            return await getBalance(wagmiConfig, { chainId: chain.id, address: userAccount.address as Address });
          } catch (error) {
            console.warn(`Failed to fetch balance for chain ${chain.id}:`, error);
            return { value: 0n };
          }
        }),
      );

      return balances.reduce(
        (acc, balance, index) => {
          acc[chains[index].id] = balance;
          return acc;
        },
        {} as Record<number, (typeof balances)[0]>,
      );
    },
    refetchInterval: 1000 * 60,
    retry: false,
  });
}
