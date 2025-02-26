import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UndefinedInitialDataOptions, UseQueryResult, queryOptions, useQuery } from "@tanstack/react-query";
import { GetSessionAccountReturnType, getSessionAccount } from "./getSessionAccount";

export function getSessionAccountQueryOptions({
  client,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
}): UndefinedInitialDataOptions<GetSessionAccountReturnType> {
  const queryKey = ["getSessionAccount", client?.uid, userAddress];
  return queryOptions<GetSessionAccountReturnType>(
    client && userAddress
      ? {
          queryKey,
          queryFn: () => getSessionAccount({ client, userAddress }),
          staleTime: Infinity,
          // TODO: replace with function to retry only connection errors
          retry: false,
        }
      : { queryKey, enabled: false },
  );
}

export function useSessionAccount(userAddress: Address | undefined): UseQueryResult<GetSessionAccountReturnType> {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getSessionAccountQueryOptions({ userAddress, client }));
}
