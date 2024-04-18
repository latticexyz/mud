import { useAccount, usePublicClient } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import gasTankConfig from "@latticexyz/gas-tank/mud.config";
import { useAppSigner } from "./useAppSigner";
import { useAppAccount } from "./useAppAccount";
import { useRecord } from "./useRecord";
import { usePaymaster } from "./usePaymaster";

export function useIsGasSpender() {
  const { chain } = useConfig();
  const gasTank = usePaymaster("gasTank");

  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const publicClient = usePublicClient({ chainId: chain.id });
  const [appSignerAccount] = useAppSigner();
  const appAccount = useAppAccount({ publicClient, appSignerAccount });
  const appAccountAddress = appAccount.data?.address;

  const result = useRecord(
    appAccountAddress && gasTank
      ? {
          chainId: chain.id,
          address: gasTank.address,
          table: gasTankConfig.tables.Spender,
          key: { spender: appAccountAddress },
          blockTag: "pending",
        }
      : {},
  );

  return {
    ...result,
    isGasSpender: userAccountAddress && userAccountAddress === result.record?.userAccount,
  };
}
