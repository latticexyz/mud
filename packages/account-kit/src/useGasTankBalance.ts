import { useAccount } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import gasTankConfig from "@latticexyz/gas-tank/mud.config";
import { useRecord } from "./useRecord";

export function useGasTankBalance() {
  const { chain, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const result = useRecord(
    userAccountAddress
      ? {
          chainId: chain.id,
          address: gasTankAddress,
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
