import { useAccount, usePublicClient } from "wagmi";
import { useLoginConfig } from "./Context";
import { useQuery } from "@tanstack/react-query";
import { useAppAccount } from "./useAppAccount";
import { useAppSigner } from "./useAppSigner";
import { getRecord } from "./getRecord";
import { Address } from "abitype";
import { PublicClient } from "viem";
import { unlimitedDelegationControlId } from "./common";
import worldConfig from "@latticexyz/world/mud.config";

export type HasDelegationOptions = {
  publicClient: PublicClient;
  worldAddress: Address;
  userAccountAddress: Address;
  appAccountAddress: Address;
};

export function hasDelegationQueryKey(data: {
  chainId: number;
  worldAddress: Address;
  userAccountAddress: Address | undefined;
  appAccountAddress: Address | undefined;
}) {
  return ["mud:hasDelegation", data] as const;
}

export async function hasDelegation({
  publicClient,
  worldAddress,
  userAccountAddress,
  appAccountAddress,
}: HasDelegationOptions): Promise<boolean> {
  const record = await getRecord(publicClient, {
    storeAddress: worldAddress,
    table: worldConfig.tables.world__UserDelegationControl,
    key: {
      delegator: userAccountAddress,
      delegatee: appAccountAddress,
    },
    blockTag: "pending",
  });
  return record.delegationControlId === unlimitedDelegationControlId;
}

export function useHasDelegation(): boolean | undefined {
  const { chainId, worldAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });
  const userAccount = useAccount();
  const [appSignerAccount] = useAppSigner();
  const appAccount = useAppAccount({ publicClient, appSignerAccount });

  const userAccountAddress = userAccount.address;
  const appAccountAddress = appAccount.data?.address;

  const queryKey = hasDelegationQueryKey({
    chainId,
    worldAddress,
    userAccountAddress,
    appAccountAddress,
  });

  const result = useQuery(
    publicClient && worldAddress && userAccountAddress && appAccountAddress
      ? {
          queryKey,
          queryFn: () =>
            hasDelegation({
              publicClient,
              worldAddress,
              userAccountAddress,
              appAccountAddress,
            }),
          staleTime: 1000 * 60 * 5,
        }
      : {
          queryKey,
          enabled: false,
        },
  );

  return result.data;
}
