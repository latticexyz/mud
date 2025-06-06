import { useQuery, skipToken } from "@tanstack/react-query";
import { Chain } from "viem";
import { useAccount, useConfig as useWagmiConfig } from "wagmi";
import { getBalance } from "wagmi/actions";

export type UseChainBalancesOptions = {
  chains: Chain[];
};

export function useChainBalances({ chains }: UseChainBalancesOptions) {
  const { address: userAddress } = useAccount();
  const wagmiConfig = useWagmiConfig();
  const chainIds = chains.map((chain) => chain.id);

  return useQuery({
    queryKey: ["chainBalances", chainIds],
    queryFn: userAddress
      ? async () => {
          const balances = await Promise.allSettled(
            chains.map((chain) => getBalance(wagmiConfig, { chainId: chain.id, address: userAddress })),
          );

          return balances.reduce(
            (acc, result, index) => {
              if (result.status === "fulfilled") {
                acc[chains[index].id] = result.value;
              }
              return acc;
            },
            {} as Record<number, Awaited<ReturnType<typeof getBalance>>>,
          );
        }
      : skipToken,
    refetchInterval: 1000 * 60,
    retry: 1,
  });
}
