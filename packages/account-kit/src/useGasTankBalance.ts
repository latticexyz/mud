import { useAccount } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import gasTankConfig from "@latticexyz/gas-tank/mud.config";
import { useRecord } from "./useRecord";
import { usePaymaster } from "./usePaymaster";

export function useGasTankBalance() {
  const { chain } = useConfig();
  const gasTank = usePaymaster("gasTank");
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const result = useRecord(
    userAccountAddress && gasTank
      ? {
          chainId: chain.id,
          address: gasTank.address,
          table: gasTankConfig.tables.UserBalances,
          key: { userAccount: userAccountAddress },
          blockTag: "pending",
          query: {
            refetchInterval: 2000,
          },
        }
      : {},
  );

  return {
    ...result,
    gasTankBalance: result.record?.balance,
  };
}
