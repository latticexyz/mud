import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, queryOptions, useQuery } from "@tanstack/react-query";
import { getSessionClient } from "./getSessionClient";
import { SessionClient } from "./common";
import { SmartAccount } from "viem/account-abstraction";
import { useSessionAccount } from "./useSessionAccount";
import { useEffect } from "react";

export function getSessionClientQueryOptions({
  sessionAccount,
  client,
  userAddress,
  worldAddress,
}: {
  sessionAccount: SmartAccount | undefined;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  worldAddress: Address;
}) {
  const queryKey = ["getSessionClient", client?.uid, userAddress, sessionAccount?.address, worldAddress];
  return queryOptions(
    client && userAddress && sessionAccount
      ? {
          queryKey,
          queryFn: () =>
            getSessionClient({
              sessionAccount,
              client,
              userAddress,
              worldAddress,
            }),
          staleTime: Infinity,
        }
      : { queryKey, enabled: false },
  );
}

export function useSessionClient(userAddress: Address | undefined): UseQueryResult<SessionClient> {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { data: sessionAccount, error: sessionAccountError } = useSessionAccount(userAddress);

  useEffect(() => {
    if (sessionAccountError) {
      console.error("Could not get session account", sessionAccountError);
    }
  }, [sessionAccountError]);

  return useQuery(
    getSessionClientQueryOptions({
      sessionAccount,
      userAddress,
      client,
      worldAddress,
    }),
  );
}
