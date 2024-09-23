import { useAccount } from "wagmi";
import { useConfig } from "./EntryConfigProvider";
import gasTankConfig from "./gas-tank/mud.config";
import { useRecord } from "./useRecord";
import { usePaymaster } from "./usePaymaster";
import { useAppAccountClient } from "./useAppAccountClient";

export function useIsGasSpender() {
  const { chainId } = useConfig();
  const gasTank = usePaymaster("gasTank");

  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const { data: appAccountClient } = useAppAccountClient();
  const appAccountAddress = appAccountClient?.account.address;

  const result = useRecord(
    appAccountClient?.type === "smartAccountClient" && appAccountAddress && gasTank
      ? {
          chainId,
          address: gasTank.address,
          table: gasTankConfig.tables.Spender,
          key: { spender: appAccountAddress },
          blockTag: "pending",
        }
      : {},
  );

  return {
    ...result,
    isGasSpender:
      appAccountClient?.type === "smartAccountClient"
        ? userAccountAddress && userAccountAddress === result.record?.userAccount
        : true,
  };
}
