import { minGasBalance } from "./common";
import { getAllowanceQueryOptions } from "./useAllowance";
import { getSpenderQueryOptions } from "./useSpender";
import { getDelegationQueryOptions } from "./useDelegation";
import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { Address, Chain, Client, Transport } from "viem";
import { getSessionAccountQueryOptions } from "../useSessionAccount";

export function getPrequisitesQueryOptions({
  queryClient,
  client,
  userAddress,
  worldAddress,
}: {
  queryClient: QueryClient;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  worldAddress: Address;
}) {
  const queryKey = ["getPrerequisites", client?.chain.id, userAddress];
  return queryOptions(
    client && userAddress
      ? {
          queryKey,
          queryFn: async () => {
            const { address: sessionAddress } = await queryClient.fetchQuery(
              getSessionAccountQueryOptions({ client, userAddress }),
            );
            const [allowance, spender, hasDelegation] = await Promise.all([
              queryClient.fetchQuery(getAllowanceQueryOptions({ client, userAddress })),
              queryClient.fetchQuery(getSpenderQueryOptions({ client, userAddress, sessionAddress })),
              queryClient.fetchQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress })),
            ]);
            // TODO: figure out better approach than null for allowance/spender when no quarry paymaster
            const hasAllowance = allowance == null || allowance >= minGasBalance;
            const isSpender = spender == null ? true : spender;
            return {
              hasAllowance,
              isSpender,
              hasDelegation,
              complete: hasAllowance && isSpender && hasDelegation,
            };
          },
        }
      : { queryKey, enabled: false },
  );
}

export function usePrerequisites(userAddress: Address | undefined) {
  const queryClient = useQueryClient();
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  // TODO: rework this so it uses other hooks so we avoid having to clear two caches when e.g. topping up

  const prereqs = useQuery(
    getPrequisitesQueryOptions({
      queryClient,
      client,
      userAddress,
      worldAddress,
    }),
    queryClient,
  );
  // console.log("prereqs", prereqs.isFetching, prereqs.isRefetching, prereqs.isFetchedAfterMount);
  return prereqs;
}
