import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useRecord } from "../useRecord";
import { paymasterTables } from "../paymaster";

export function useAllowance(user: Address | undefined) {
  const { chainId, paymasterAddress } = useEntryKitConfig();

  return useRecord({
    chainId,
    address: paymasterAddress,
    ...(user
      ? {
          table: paymasterTables.Allowance,
          key: { user },
        }
      : null),
  });
}
