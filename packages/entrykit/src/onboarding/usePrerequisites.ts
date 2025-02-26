import { minGasBalance } from "./common";
import { getAllowanceQueryOptions } from "./quarry/useAllowance";
import { getSpenderQueryOptions } from "./quarry/useSpender";
import { getDelegationQueryOptions } from "./useDelegation";
import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { Config, useClient, useConfig } from "wagmi";
import { Address, Chain, Client, Transport } from "viem";
import { getSessionAccountQueryOptions } from "../useSessionAccount";
import { getPaymaster } from "../getPaymaster";
import { getBalanceQueryOptions } from "wagmi/query";

export function getPrequisitesQueryOptions({
  queryClient,
  config,
  client,
  userAddress,
  worldAddress,
}: {
  queryClient: QueryClient;
  config: Config;
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  worldAddress: Address;
}) {
  const queryKey = ["getPrerequisites", client?.uid, userAddress];
  return queryOptions(
    client && userAddress
      ? {
          queryKey,
          async queryFn() {
            const paymaster = getPaymaster(client.chain);

            const {
              account: { address: sessionAddress },
            } = await queryClient.fetchQuery(getSessionAccountQueryOptions({ client, userAddress }));
            const [sessionBalance, allowance, spender, hasDelegation] = await Promise.all([
              !paymaster
                ? queryClient.fetchQuery(
                    getBalanceQueryOptions(config, { chainId: client.chain.id, address: sessionAddress }),
                  )
                : null,
              paymaster?.type === "quarry"
                ? queryClient.fetchQuery(getAllowanceQueryOptions({ client, userAddress }))
                : null,
              paymaster?.type === "quarry"
                ? queryClient.fetchQuery(getSpenderQueryOptions({ client, userAddress, sessionAddress }))
                : null,
              queryClient.fetchQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress })),
            ]);
            // TODO: figure out better approach than null for allowance/spender when no quarry paymaster
            const hasAllowance = allowance == null || allowance >= minGasBalance;
            const isSpender = spender == null ? true : spender;
            const hasGasBalance = sessionBalance == null || sessionBalance.value >= minGasBalance;
            return {
              sessionAddress,
              hasAllowance,
              isSpender,
              hasGasBalance,
              hasDelegation,
              // we intentionally don't enforce an allowance/gas balance here
              complete: isSpender && hasDelegation,
            };
          },
          retry: false,
        }
      : { queryKey, enabled: false },
  );
}

export function usePrerequisites(userAddress: Address | undefined) {
  const queryClient = useQueryClient();
  const config = useConfig();
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  // TODO: rework this so it uses other hooks so we avoid having to clear two caches when e.g. topping up

  const prereqs = useQuery(
    getPrequisitesQueryOptions({
      queryClient,
      config,
      client,
      userAddress,
      worldAddress,
    }),
    queryClient,
  );
  // console.log("prereqs", prereqs.data);
  return prereqs;
}
