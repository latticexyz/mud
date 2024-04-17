import { useAccount, usePublicClient } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import { QueryObserverOptions, useQuery } from "@tanstack/react-query";
import { getRecord } from "./utils/getRecord";
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
  console.log("getting gas tank balance record");
  const record = await getRecord(publicClient, {
    storeAddress: worldAddress,
    table: gasTankConfig.tables.UserBalances,
    key: {
      userAccount: userAccountAddress,
    },
    blockTag: "pending",
  });
  console.log("got gas tank balance record", record);

  return record.balance;
}

export function useGasTankBalance(): bigint | undefined {
  const { chain, gasTankAddress } = useConfig();
  const publicClient = usePublicClient({ chainId: chain.id });

  // TODO: better error
  // TODO: make gas tank address optional, display diffent step if none configured
  if (!gasTankAddress) {
    throw new Error("No gas tank address");
  }

  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const queryKey = getGasTankBalanceQueryKey({ chainId: chain.id, gasTankAddress, userAccountAddress });

  const result = useQuery(
    publicClient && gasTankAddress && userAccountAddress
      ? ({
          queryKey,
          queryFn: () =>
            getGasTankBalance({
              publicClient,
              worldAddress: gasTankAddress,
              userAccountAddress,
            }),
          refetchInterval: 2000,
        } satisfies QueryObserverOptions)
      : {
          queryKey,
          enabled: false,
        },
  );

  return result.data;
}
