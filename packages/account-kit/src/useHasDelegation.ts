import { useAccount } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import { unlimitedDelegationControlId } from "./common";
import worldConfig from "@latticexyz/world/mud.config";
import { useRecord } from "./useRecord";
import { useAppAccountClient } from "./useAppAccountClient";

export function useHasDelegation() {
  const { chain, worldAddress } = useConfig();

  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const { data: appAccountClient } = useAppAccountClient();
  const appAccountAddress = appAccountClient?.account.address;

  const result = useRecord(
    userAccountAddress && appAccountAddress
      ? {
          chainId: chain.id,
          address: worldAddress,
          table: worldConfig.tables.world__UserDelegationControl,
          key: {
            delegator: userAccountAddress,
            delegatee: appAccountAddress,
          },
          blockTag: "pending",
          query: {
            staleTime: 1000 * 60 * 5,
          },
        }
      : {},
  );

  return {
    ...result,
    hasDelegation: result.record?.delegationControlId === unlimitedDelegationControlId,
  };
}
