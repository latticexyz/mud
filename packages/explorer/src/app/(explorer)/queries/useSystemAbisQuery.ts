import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { SystemAbisResponse } from "../api/system-abis/route";
import { useChain } from "../hooks/useChain";

export function useSystemAbisQuery() {
  const { worldAddress, chainName } = useParams();
  const { id: chainId } = useChain();

  return useQuery<SystemAbisResponse, Error, SystemAbisResponse["abis"]>({
    queryKey: ["systemAbis", worldAddress, chainName],
    queryFn: async () => {
      const res = await fetch(
        `/api/system-abis?${new URLSearchParams({ chainId: chainId.toString(), worldAddress: worldAddress as Hex })}`,
      );
      const data = await res.json();
      return data;
    },
    select: (data) => data.abis,
    retry: false,
  });
}
