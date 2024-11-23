import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, queryOptions, useQuery } from "@tanstack/react-query";
import { getSessionAccount } from "./getSessionAccount";
import { SmartAccount } from "viem/account-abstraction";

export function getSessionAccountQueryOptions({
  client,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
}) {
  const queryKey = ["getSessionAccount", client?.chain.id, userAddress];
  return queryOptions(
    client && userAddress
      ? {
          queryKey,
          queryFn: () => getSessionAccount({ client, userAddress }),
          staleTime: Infinity,
        }
      : { queryKey, enabled: false },
  );
}

export function useSessionAccount(userAddress: Address | undefined): UseQueryResult<SmartAccount> {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getSessionAccountQueryOptions({ userAddress, client }));
}
