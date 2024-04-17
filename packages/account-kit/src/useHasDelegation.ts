import { useAccount, usePublicClient } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import { useAppAccount } from "./useAppAccount";
import { useAppSigner } from "./useAppSigner";
import { unlimitedDelegationControlId } from "./common";
import worldConfig from "@latticexyz/world/mud.config";
import { useRecord } from "./useRecord";

export function useHasDelegation() {
  const { chain, worldAddress } = useConfig();
  const publicClient = usePublicClient({ chainId: chain.id });
  const userAccount = useAccount();
  const [appSignerAccount] = useAppSigner();
  const appAccount = useAppAccount({ publicClient, appSignerAccount });

  const userAccountAddress = userAccount.address;
  const appAccountAddress = appAccount.data?.address;

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
