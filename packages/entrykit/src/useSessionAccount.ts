import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UndefinedInitialDataOptions, UseQueryResult, queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { GetSessionAccountReturnType, getSessionAccount } from "./getSessionAccount";

export function getSessionAccountQueryOptions({
  client,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
}): UndefinedInitialDataOptions<GetSessionAccountReturnType> {
  return queryOptions<GetSessionAccountReturnType>({
    queryKey: ["getSessionAccount", client?.uid, userAddress],
    queryFn: client && userAddress ? () => getSessionAccount({ client, userAddress }) : skipToken,
    staleTime: Infinity,
    // TODO: replace with function to retry only connection errors
    retry: false,
  });
}

export function useSessionAccount(userAddress: Address | undefined): UseQueryResult<GetSessionAccountReturnType> {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getSessionAccountQueryOptions({ userAddress, client }));
}
