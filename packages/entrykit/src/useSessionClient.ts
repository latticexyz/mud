import { Address } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getSessionClient } from "./getSessionClient";
import { SessionClient } from "./common";

export function useSessionClient(userAddress: Address | undefined): UseQueryResult<SessionClient> {
  const { chainId, bundlerTransport, paymasterAddress, worldAddress, explorerUrl } = useEntryKitConfig();
  const client = useClient({ chainId });

  const queryKey = ["sessionClient", client?.uid, userAddress];
  return useQuery(
    client && userAddress
      ? {
          queryKey,
          queryFn: async () => {
            return await getSessionClient({
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
