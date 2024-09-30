import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";

export function useENS(address: Hex | undefined) {
  const normalizedAddress = address?.toLowerCase();
  return useQuery<{
    address: string | undefined;
    name: string | undefined;
    displayName: string | undefined;
    avatar: string | undefined;
  }>({
    enabled: !!normalizedAddress,
    queryKey: ["ens", normalizedAddress],
    initialData: {
      address: undefined,
      name: undefined,
      displayName: undefined,
      avatar: undefined,
    },
    queryFn: async () => {
      // TODO: typed response
      const data = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedAddress}`).then((res) => res.json());
      return {
        address: data.address ?? undefined,
        name: data.name ?? undefined,
        displayName: data.displayName ?? undefined,
        avatar: data.avatar ?? undefined,
      };
    },
  });
}
