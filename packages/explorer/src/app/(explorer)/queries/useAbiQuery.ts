import { useParams } from "next/navigation";
import { AbiFunction, Hex } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { validateChainName } from "../../../common";

type AbiQueryResult = {
  abi: AbiFunction[];
  isWorldDeployed: boolean;
};

export function useAbiQuery(): UseQueryResult<AbiQueryResult> {
  const { chainName, worldAddress } = useParams();
  validateChainName(chainName);

  return useQuery({
    queryKey: ["abi", chainName, worldAddress],
    queryFn: async () => {
      const res = await fetch(
        `/api/world-abi/?${new URLSearchParams({ chainName, worldAddress: worldAddress as Hex })}`,
      );
      const data = await res.json();
      return data;
    },
    select: (data) => {
      return {
        abi: data.abi || [],
        isWorldDeployed: data.isWorldDeployed,
      };
    },
    refetchInterval: 15000,
  });
}
