import { Address, Chain, Client, Transport } from "viem";
import { Config, useClient, useConfig } from "wagmi";
import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpenderQueryOptions } from "./quarry/useSpender";
import { getDelegationQueryOptions } from "./useDelegation";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { getSessionAccountQueryOptions } from "../useSessionAccount";
import { getFundsQueryOptions } from "../useFunds";

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
    queryFn: async () => {
      if (!client) throw new Error("Viem client not ready.");
      if (!userAddress) throw new Error("User not connected.");

      const {
        account: { address: sessionAddress },
      } = await queryClient.fetchQuery(getSessionAccountQueryOptions({ client, userAddress }));

      const [funds, spender, hasDelegation] = await Promise.all([
        queryClient.fetchQuery(getFundsQueryOptions({ queryClient, config, client, userAddress })),
        queryClient.fetchQuery(getSpenderQueryOptions({ client, userAddress, sessionAddress })),
        queryClient.fetchQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress })),
      ]);

      // TODO: figure out better approach than null for allowance/spender when no quarry paymaster
      const hasAllowance = funds.paymasterAllowance == null || funds.paymasterAllowance > 0n;
      const isSpender = spender == null ? true : spender;
      const hasGasBalance = funds.sessionBalance == null || funds.sessionBalance > 0n;
      const hasQuarryGasBalance = funds.paymasterBalance == null || funds.paymasterBalance > 0n;

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
    },
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
