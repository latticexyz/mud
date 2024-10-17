import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useRecord } from "../useRecord";
import { paymasterTables } from "../paymaster";

export function useSpender(spender: Address | undefined) {
  const { chainId, paymasterAddress } = useEntryKitConfig();

  return useRecord({
    chainId,
    address: paymasterAddress,
    ...(spender
      ? {
          table: paymasterTables.Spender,
          key: { spender },
        }
      : null),
  });
}
