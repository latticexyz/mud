import { useAccount, useClient } from "wagmi";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { unlimitedDelegationControlId } from "./common";
import worldConfig from "@latticexyz/world/mud.config";
import { useAppAccount } from "./useAppAccount";
import { getRecord } from "./utils/getRecord";
import { useQuery } from "@tanstack/react-query";

export function useHasDelegation() {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const wallet = useAccount();
  const walletAddress = wallet?.address;
  const { data: appAccount } = useAppAccount();
  const appAccountAddress = appAccount?.address;

  const queryKey = ["hasDelegation", chainId, worldAddress, walletAddress, appAccountAddress];
  const result = useQuery(
    client && walletAddress && appAccountAddress
      ? {
          queryKey,
          queryFn: async () =>
            await getRecord(client, {
              address: worldAddress,
              table: worldConfig.tables.world__UserDelegationControl,
              key: {
                delegator: walletAddress,
                delegatee: appAccountAddress,
              },
              blockTag: "pending",
            }),
          staleTime: 1000 * 60 * 5,
        }
      : { queryKey, enabled: false },
  );

  return {
    ...result,
    hasDelegation: result.data?.delegationControlId === unlimitedDelegationControlId,
  };
}
