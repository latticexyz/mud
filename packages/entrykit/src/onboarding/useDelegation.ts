import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useRecord } from "../useRecord";
import { worldTables } from "../common";

export function useDelegation(delegator: Address | undefined, delegatee: Address | undefined) {
  const { chainId, worldAddress } = useEntryKitConfig();

  return useRecord({
    chainId,
    address: worldAddress,
    ...(delegator && delegatee
      ? {
          table: worldTables.UserDelegationControl,
          key: { delegator, delegatee },
        }
      : null),
  });
}
