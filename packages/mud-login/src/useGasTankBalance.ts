import { useAccount, usePublicClient } from "wagmi";
import { useLoginConfig } from "./Context";
import { useQuery } from "@tanstack/react-query";
import { getRecord } from "./getRecord";
import { Address } from "abitype";
import { PublicClient } from "viem";
import gasTankConfig from "@latticexyz/gas-tank/mud.config";

export type GetGasTankBalanceOptions = {
  publicClient: PublicClient;
  worldAddress: Address;
  userAccountAddress: Address;
};

export function getGasTankBalanceQueryKey(data: {
  chainId: number;
  gasTankAddress: Address;
  userAccountAddress: Address | undefined;
}) {
  return ["mud:getGasTankBalance", data] as const;
}

export async function getGasTankBalance({
  publicClient,
  worldAddress,
  userAccountAddress,
}: GetGasTankBalanceOptions): Promise<bigint> {
  const record = await getRecord(publicClient, {
    storeAddress: worldAddress,
    table: gasTankConfig.tables.UserBalances,
    key: {
      userAccount: userAccountAddress,
    },
    blockTag: "pending",
  });
  return record.balance;
}

export function useGasTankBalance(): bigint | undefined {
  const { chainId, gasTankAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });

  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const queryKey = getGasTankBalanceQueryKey({ chainId, gasTankAddress, userAccountAddress });

  const result = useQuery(
    publicClient && gasTankAddress && userAccountAddress
      ? {
          queryKey,
          queryFn: () =>
            getGasTankBalance({
              publicClient,
              worldAddress: gasTankAddress,
              userAccountAddress,
            }),
        }
      : {
          queryKey,
          enabled: false,
        },
  );

  return result.data;
}
