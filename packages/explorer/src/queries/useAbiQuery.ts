import { useParams } from "next/navigation";
import { AbiFunction, Hex } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useChainId } from "../hooks/useChainId";

export async function getAbi(chainId: number, worldAddress: Hex) {
  const res = await fetch(`/api/world?${new URLSearchParams({ chainId: String(chainId), worldAddress })}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

type AbiQueryResult = {
  abi: AbiFunction[];
  isWorldDeployed: boolean;
};

export const useAbiQuery = (): UseQueryResult<AbiQueryResult> => {
  const { worldAddress } = useParams();
  const chainId = useChainId();

  return useQuery({
    queryKey: ["abi", chainId, worldAddress],
    queryFn: () => getAbi(chainId, worldAddress as Hex),
    select: (data) => {
      return {
        abi: data.abi || [],
        isWorldDeployed: data.isWorldDeployed,
      };
    },
    refetchInterval: 15000,
  });
};
