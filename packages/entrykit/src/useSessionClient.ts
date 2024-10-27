import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, queryOptions, useQuery } from "@tanstack/react-query";
import { getSessionClient } from "./getSessionClient";
import { SessionClient } from "./common";
import { EntryKitConfig } from "./config";
import { SmartAccount } from "viem/account-abstraction";
import { useSessionAccount } from "./useSessionAccount";

export function getSessionClientQueryOptions({
  sessionAccount,
  client,
  userAddress,
  bundlerTransport,
  paymasterAddress,
  worldAddress,
  explorerUrl,
}: {
  sessionAccount: SmartAccount | undefined;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
} & Pick<EntryKitConfig, "bundlerTransport" | "paymasterAddress" | "worldAddress" | "explorerUrl">) {
  // TODO: figure out how to get bundlerTransport in here
  const queryKey = [
    "getSessionClient",
    client?.uid,
    userAddress,
    sessionAccount?.address,
    worldAddress,
    paymasterAddress,
    explorerUrl,
  ];
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
              bundlerTransport,
              paymasterAddress,
              explorerUrl,
            }),
          staleTime: Infinity,
        }
      : { queryKey, enabled: false },
  );
}

export function useSessionClient(userAddress: Address | undefined): UseQueryResult<SessionClient> {
  const { chainId, bundlerTransport, paymasterAddress, worldAddress, explorerUrl } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { data: sessionAccount } = useSessionAccount(userAddress);
  return useQuery(
    getSessionClientQueryOptions({
      sessionAccount,
      userAddress,
      client,
      bundlerTransport,
      paymasterAddress,
      worldAddress,
      explorerUrl,
    }),
  );
}
