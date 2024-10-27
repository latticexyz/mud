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
  paymasterAddress,
  worldAddress,
}: {
  queryClient: QueryClient;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  paymasterAddress: Address;
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
            const [allowance, isSpender, hasDelegation] = await Promise.all([
              queryClient.fetchQuery(getAllowanceQueryOptions({ client, paymasterAddress, userAddress })),
              queryClient.fetchQuery(getSpenderQueryOptions({ client, paymasterAddress, userAddress, sessionAddress })),
              queryClient.fetchQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress })),
            ]);
            const hasAllowance = allowance >= minGasBalance;
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
  const { chainId, paymasterAddress, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  return useQuery(
    getPrequisitesQueryOptions({
      queryClient,
      client,
      userAddress,
      paymasterAddress,
      worldAddress,
    }),
    queryClient,
  );
}
