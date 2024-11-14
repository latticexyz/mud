import { useParams } from "next/navigation";
import { AbiFunction, Hex } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { supportedChains, validateChainName } from "../../../common";

type AbiQueryResult = {
  abi: AbiFunction[];
  isWorldDeployed: boolean;
};

export function useWorldAbiQuery(): UseQueryResult<AbiQueryResult> {
  const { chainName, worldAddress } = useParams();
  validateChainName(chainName);
  const { id: chainId } = supportedChains[chainName];

  return useQuery({
    queryKey: ["worldAbi", chainName, worldAddress],
    queryFn: async () => {
      const res = await fetch(
        `/api/world-abi?${new URLSearchParams({ chainId: chainId.toString(), worldAddress: worldAddress as Hex })}`,
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
    refetchInterval: 5000,
  });
}
