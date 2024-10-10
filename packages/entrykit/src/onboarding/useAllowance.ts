import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useRecord } from "../useRecord";
import { paymasterTables } from "./paymaster";

export function useAllowance(userAddress: Address) {
  const { chainId, paymasterAddress } = useEntryKitConfig();

  return useRecord({
    chainId,
    address: paymasterAddress,
    table: paymasterTables.Allowance,
    key: { user: userAddress },
  });
}
