import { Address } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getAppAccountClient } from "./getAppAccountClient";
import { AppAccountClient } from "./common";

export function useAppAccountClient(userAddress: Address | undefined): UseQueryResult<AppAccountClient> {
  const { chainId, bundlerTransport, paymasterAddress, worldAddress, explorerUrl } = useEntryKitConfig();
  const client = useClient({ chainId });

  const queryKey = ["appAccountClient", client?.uid, userAddress];
  return useQuery(
    client && userAddress
      ? {
          queryKey,
          queryFn: async () => {
            return await getAppAccountClient({
              worldAddress,
              userAddress,
              client,
              bundlerTransport,
              paymasterAddress,
              explorerUrl,
            });
          },
          staleTime: Infinity,
        }
      : { queryKey, enabled: false },
  );
}
