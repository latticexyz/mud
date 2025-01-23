import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "../hooks/useChain";
import { indexerForChainId } from "../utils/indexerForChainId";

export function useTransactionsQuery() {
  const { worldAddress, chainName } = useParams();
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);

  return useQuery({
    queryKey: ["transactions", worldAddress, chainName],
    queryFn: async () => {
      const offset = 0;
      const limit = 20;
      const response = await fetch(
        `/api/transactions?${new URLSearchParams({
          worldAddress: worldAddress as Hex,
          offset: offset.toString(),
          limit: limit.toString(),
        })}`,
        {
          method: "GET",
        },
      );

      return response.json();
    },
    select: (data) => {
      return data.transactions;
    },
    retry: false,
    enabled: !!worldAddress && indexer.type === "hosted",
    refetchInterval: 2000,
  });
}
