import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";

export type ENSData = {
  address: string | undefined;
  name: string | undefined;
  displayName: string | undefined;
  avatar: string | undefined;
};

export function useENS(address: Hex | undefined) {
  const normalizedAddress = address?.toLowerCase();
  return useQuery<ENSData>({
    queryKey: ["ens", normalizedAddress],
    queryFn: async () => {
      const data = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedAddress}`).then((res) => res.json());
      return {
        address: data.address ?? undefined,
        name: data.name ?? undefined,
        displayName: data.displayName ?? undefined,
        avatar: data.avatar ?? undefined,
      };
    },
    enabled: !!normalizedAddress,
  });
}

export async function resolveENS(address: Hex): Promise<ENSData> {
  const normalizedAddress = address.toLowerCase();
  const data = await fetch(`https://api.ensideas.com/ens/resolve/${normalizedAddress}`).then((res) => res.json());
  return {
    address: data.address ?? undefined,
    name: data.name ?? undefined,
    displayName: data.displayName ?? undefined,
    avatar: data.avatar ?? undefined,
  };
}
