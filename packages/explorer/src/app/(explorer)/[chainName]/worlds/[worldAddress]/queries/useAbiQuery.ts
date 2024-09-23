import { useParams } from "next/navigation";
import { AbiFunction } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useApiBaseUrl } from "../../../../../../hooks/useApiUrl";

type AbiQueryResult = {
  abi: AbiFunction[];
  isWorldDeployed: boolean;
};

export function useAbiQuery(): UseQueryResult<AbiQueryResult> {
  const { chainName, worldAddress } = useParams();
  const apiBaseUrl = useApiBaseUrl();

  return useQuery({
    queryKey: ["abi", chainName, worldAddress],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/world-abi`);
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
