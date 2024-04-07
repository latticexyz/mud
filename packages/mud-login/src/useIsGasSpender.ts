import { useAccount, usePublicClient } from "wagmi";
import { useLoginConfig } from "./Context";
import { useQuery } from "@tanstack/react-query";
import { getRecord } from "./getRecord";
import { Address } from "abitype";
import { PublicClient } from "viem";
import gasTankConfig from "@latticexyz/gas-tank/mud.config";
import { useAppSigner } from "./useAppSigner";
import { useAppAccount } from "./useAppAccount";

export type IsGasSpenderOptions = {
  publicClient: PublicClient;
  gasTankAddress: Address;
  userAccountAddress: Address;
  appAccountAddress: Address;
};

export function isGasSpenderQueryKey(data: {
  chainId: number;
  gasTankAddress: Address;
  userAccountAddress: Address | undefined;
  appAccountAddress: Address | undefined;
}) {
  return ["mud:isGasSpender", data] as const;
}

export async function isGasSpender({
  publicClient,
  gasTankAddress,
  userAccountAddress,
  appAccountAddress,
}: IsGasSpenderOptions): Promise<boolean> {
  const record = await getRecord(publicClient, {
    storeAddress: gasTankAddress,
    table: gasTankConfig.tables.Spender,
    key: {
      spender: appAccountAddress,
    },
    blockTag: "pending",
  });
  return record.userAccount === userAccountAddress;
}

export function useIsGasSpender(): boolean | undefined {
  const { chainId, gasTankAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });

  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const [appSignerAccount] = useAppSigner();
  const appAccount = useAppAccount({ publicClient, appSignerAccount });
  const appAccountAddress = appAccount.data?.address;

  const queryKey = isGasSpenderQueryKey({ chainId, gasTankAddress, userAccountAddress, appAccountAddress });

  const result = useQuery(
    publicClient && gasTankAddress && userAccountAddress && appAccountAddress
      ? {
          queryKey,
          queryFn: () =>
            isGasSpender({
              publicClient,
              gasTankAddress,
              userAccountAddress,
              appAccountAddress,
            }),
        }
      : {
          queryKey,
          enabled: false,
        },
  );

  return result.data;
}
