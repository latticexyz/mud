import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, queryOptions, useQuery } from "@tanstack/react-query";
import { getSessionClient } from "./getSessionClient";
import { SessionClient } from "./common";
import { SmartAccount } from "viem/account-abstraction";
import { useSessionAccount } from "./useSessionAccount";

export function getSessionClientQueryOptions({
  sessionAccount,
  client,
  userAddress,
  worldAddress,
  paymasterAddress,
}: {
  sessionAccount: SmartAccount | undefined;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  worldAddress: Address;
  paymasterAddress: Address;
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
              paymasterAddress,
            }),
          staleTime: Infinity,
        }
      : { queryKey, enabled: false },
  );
}

export function useSessionClient(userAddress: Address | undefined): UseQueryResult<SessionClient> {
  const { chainId, worldAddress, paymasterAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { data: sessionAccount } = useSessionAccount(userAddress);
  return useQuery(
    getSessionClientQueryOptions({
      sessionAccount,
      userAddress,
      client,
      worldAddress,
      paymasterAddress,
    }),
  );
}
