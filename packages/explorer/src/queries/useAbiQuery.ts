import { useParams } from "next/navigation";
import { AbiFunction, Hex } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

async function getAbi(worldAddress: Hex) {
  const res = await fetch(`/api/world?${new URLSearchParams({ address: worldAddress })}`);
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

export function useAbiQuery(): UseQueryResult<AbiQueryResult> {
  const { worldAddress } = useParams();
  return useQuery({
    queryKey: ["abi", worldAddress],
    queryFn: () => getAbi(worldAddress as Hex),
    select: (data) => {
      return {
        abi: data.abi || [],
        isWorldDeployed: data.isWorldDeployed,
      };
    },
    refetchInterval: 15000,
  });
}
