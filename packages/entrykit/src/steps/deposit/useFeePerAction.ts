import { useConfig } from "../../EntryKitConfigProvider";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import { getGasPrice } from "viem/actions";
import { getAction, padHex } from "viem/utils";
import { BaseError, ChainDoesNotSupportContract } from "viem";
import { estimateL1Fee } from "viem/op-stack";

export function useFeePerAction(): UseQueryResult<bigint> {
  const { data: appAccountClient } = useAppAccountClient();
  // TODO: derive these from historical actions for the given world
  const { gasPerAction = 500_000n, calldataPerAction = 512 } = useConfig();

  const queryKey = ["feePerAction", gasPerAction.toString(), calldataPerAction];
  const fees = useQuery(
    appAccountClient
      ? {
          queryKey,
          queryFn: async () => {
            const [feeL2, feeL1] = await Promise.all([
              getAction(appAccountClient, getGasPrice, "getGasPrice")({}),
              getAction(
                appAccountClient,
                estimateL1Fee,
                "estimateL1Fee",
              )({
                chain: appAccountClient.chain,
                account: appAccountClient.account,
                data: padHex("0x", { size: calldataPerAction }),
              }).catch((error) => {
                if (error instanceof BaseError && error.walk((e) => e instanceof ChainDoesNotSupportContract)) {
                  return 0n;
                }
                throw error;
              }),
            ]);

            return feeL1 + feeL2 * gasPerAction;
          },
        }
      : { queryKey, enabled: false },
  );

  return fees;
}
