import { createPublicClient, http } from "viem";
import { getEnsAddress } from "viem/actions";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { useQuery } from "@tanstack/react-query";

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

function isValidEnsName(name: string): boolean {
  return name.includes(".");
}

// This is a workaround implementation because wagmi's useEnsAddress hook
// requires configuring mainnet in the wagmi config.
export function useEnsAddress(name: string) {
  return useQuery({
    queryKey: ["ensAddress", name],
    queryFn: async () => {
      const normalizedName = normalize(name);
      const address = await getEnsAddress(mainnetClient, {
        name: normalizedName,
      });

      if (!address) {
        throw new Error("Invalid ENS name");
      }

      return address;
    },
    enabled: isValidEnsName(name),
  });
}
