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
import { EntryKitConfig } from "./config/output";
import { getSessionClient } from "./getSessionClient";
import { SessionClient } from "./common";
import { getSessionAccountQueryOptions } from "./useSessionAccount";

export function getSessionClientQueryOptions({
  queryClient,
  client,
  userAddress,
  worldAddress,
  paymasterOverride,
}: {
  queryClient: QueryClient;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  worldAddress: Address;
  paymasterOverride: EntryKitConfig["paymasterOverride"];
}): UndefinedInitialDataOptions<SessionClient> {
  return queryOptions<SessionClient>({
    queryKey: ["getSessionClient", client?.uid, userAddress, worldAddress],
    queryFn: async () => {
      if (!userAddress) throw new Error("User not connected.");

      const { account: sessionAccount, signer: sessionSigner } = await queryClient.fetchQuery(
        getSessionAccountQueryOptions({ client, userAddress }),
      );
      return await getSessionClient({
        sessionAccount,
        sessionSigner,
        userAddress,
        worldAddress,
        paymasterOverride,
      });
    },
    staleTime: Infinity,
    // TODO: replace with function to retry only connection errors
    retry: false,
  });
}

export function useSessionClient(userAddress: Address | undefined): UseQueryResult<SessionClient> {
  const queryClient = useQueryClient();
  const { chainId, worldAddress, paymasterOverride } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(
    getSessionClientQueryOptions({
      queryClient,
      client,
      userAddress,
      worldAddress,
      paymasterOverride,
    }),
  );
}
