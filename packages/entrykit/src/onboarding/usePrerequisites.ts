import { Address, Chain, Client, Transport } from "viem";
import { Config, useClient, useConfig } from "wagmi";
import { getBalanceQueryOptions } from "wagmi/query";
import { QueryClient, queryOptions, skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaymaster } from "../getPaymaster";
import { getAllowanceQueryOptions } from "./quarry/useAllowance";
import { getSpenderQueryOptions } from "./quarry/useSpender";
import { getDelegationQueryOptions } from "./useDelegation";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { getSessionAccountQueryOptions } from "../useSessionAccount";
import { getBalanceQueryOptions as getQuarryBalanceQueryOptions } from "./quarry/useBalance";

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
  return queryOptions({
    queryKey: ["getPrerequisites", client?.uid, userAddress],
    queryFn:
      client && userAddress
        ? async () => {
            const paymaster = getPaymaster(client.chain);

            const {
              account: { address: sessionAddress },
            } = await queryClient.fetchQuery(getSessionAccountQueryOptions({ client, userAddress }));
            const [sessionBalance, allowance, spender, quarryBalance, hasDelegation] = await Promise.all([
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
              paymaster?.type === "quarry"
                ? queryClient.fetchQuery(getQuarryBalanceQueryOptions({ client, userAddress }))
                : null,
              queryClient.fetchQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress })),
            ]);
            // TODO: figure out better approach than null for allowance/spender when no quarry paymaster
            const hasAllowance = allowance == null || allowance > 0n;
            const isSpender = spender == null ? true : spender;
            const hasGasBalance = sessionBalance == null || sessionBalance.value > 0n;
            const hasQuarryGasBalance = quarryBalance == null || quarryBalance > 0n;

            return {
              sessionAddress,
              hasAllowance,
              isSpender,
              hasGasBalance,
              hasQuarryGasBalance,
              hasDelegation,
              // we intentionally don't enforce an allowance/gas balance here
              complete: isSpender && hasDelegation,
            };
          }
        : skipToken,
    retry: false,
  });
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
