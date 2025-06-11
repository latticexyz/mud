import { useAccount, useConfig as useWagmiConfig } from "wagmi";
import { getBalance } from "wagmi/actions";
import { useQuery, skipToken } from "@tanstack/react-query";
import { isNotNull } from "@latticexyz/common/utils";
import { ChainWithRelay } from "./ChainSelect";

type Props = {
  chains: ChainWithRelay[];
};

export function useChainBalances({ chains }: Props) {
  const { address: userAddress } = useAccount();
  const wagmiConfig = useWagmiConfig();
  const chainIds = chains.map((chain) => chain.id);

  return useQuery({
    queryKey: ["chainBalances", chainIds, userAddress],
    queryFn: userAddress
      ? async () => {
          const chainBalances = await Promise.allSettled(
            chains.map(async (chain) => {
              const balance = await getBalance(wagmiConfig, { chainId: chain.id, address: userAddress });
              return { chain, balance };
            }),
          );

          return chainBalances.map((result) => (result.status === "fulfilled" ? result.value : null)).filter(isNotNull);
        }
      : skipToken,
    refetchInterval: 1000 * 60,
    retry: 1,
  });
}
