import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useChain } from "../hooks/useChain";
import { indexerForChainId } from "../utils/indexerForChainId";

export function useTransactionsQuery() {
  const { worldAddress, chainName } = useParams();
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);

  return useInfiniteQuery({
    queryKey: ["transactions", worldAddress, chainName],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/transactions?${new URLSearchParams({
          worldAddress: worldAddress as Hex,
          ...(pageParam ? { lastBlockNumber: pageParam.toString() } : {}),
        })}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Network response was not ok");
      }

      return data;
    },

    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.transactions?.length) return null;
      const lastTransaction = lastPage.transactions[lastPage.transactions.length - 1];
      return lastTransaction?.block_num ?? null;
    },
    select: (data) => data.pages[data.pages.length - 1].transactions,
    retry: false,
    enabled: indexer.type === "hosted",
    refetchInterval: (query) => (!query.state.error ? 2000 : false),
  });
}
