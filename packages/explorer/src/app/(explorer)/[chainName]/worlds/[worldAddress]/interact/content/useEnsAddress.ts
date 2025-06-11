import { createPublicClient, http } from "viem";
import { getEnsAddress } from "viem/actions";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { skipToken, useQuery } from "@tanstack/react-query";

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

function isValidEnsName(name: string): boolean {
  if (!name.includes(".")) {
    return false;
  }

  const parts = name.split(".");
  return parts.length >= 2 && !!parts[1] && parts[1].length > 0;
}

// This is a workaround implementation because wagmi's useEnsAddress hook
// requires configuring mainnet in the wagmi config.
export function useEnsAddress(name: string | undefined) {
  return useQuery({
    queryKey: ["ensAddress", name],
    queryFn:
      !!name && isValidEnsName(name)
        ? async () => {
            const normalizedName = normalize(name);
            const address = await getEnsAddress(mainnetClient, {
              name: normalizedName,
            });

            if (!address) {
              throw new Error("Invalid ENS name");
            }

            return address;
          }
        : skipToken,
    retry: 1,
  });
}
