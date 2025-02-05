import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import {
  QueryClient,
  UndefinedInitialDataOptions,
  UseQueryResult,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getSessionClient } from "./getSessionClient";
import { SessionClient } from "./common";
import { getSessionAccountQueryOptions } from "./useSessionAccount";

export function getSessionClientQueryOptions({
  queryClient,
  client,
  userAddress,
  worldAddress,
}: {
  queryClient: QueryClient;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  worldAddress: Address;
}): UndefinedInitialDataOptions<SessionClient> {
  const queryKey = ["getSessionClient", client?.uid, userAddress, worldAddress];
  return queryOptions<SessionClient>(
    userAddress
      ? {
          queryKey,
          async queryFn() {
            const sessionAccount = await queryClient.fetchQuery(getSessionAccountQueryOptions({ client, userAddress }));
            return await getSessionClient({
              sessionAccount,
              userAddress,
              worldAddress,
            });
          },
          staleTime: Infinity,
          // TODO: replace with function to retry only connection errors
          retry: false,
        }
      : { queryKey, enabled: false },
  );
}

export function useSessionClient(userAddress: Address | undefined): UseQueryResult<SessionClient> {
  const queryClient = useQueryClient();
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(
    getSessionClientQueryOptions({
      queryClient,
      client,
      userAddress,
      worldAddress,
    }),
  );
}
