import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { getRecord } from "../utils/getRecord";
import { useQuery } from "@tanstack/react-query";
import { unlimitedDelegationControlId, worldTables } from "../common";

export function getDelegationQueryKey({
  client,
  worldAddress,
  userAddress,
  appAccountAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  worldAddress: Address;
  userAddress: Address | undefined;
  appAccountAddress: Address | undefined;
}) {
  return ["delegation", client?.chain.id, worldAddress, userAddress, appAccountAddress];
}

export function useDelegation(userAddress: Address | undefined, appAccountAddress: Address | undefined) {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  const queryKey = getDelegationQueryKey({ client, worldAddress, userAddress, appAccountAddress });
  return useQuery(
    client && userAddress && appAccountAddress
      ? {
          queryKey,
          queryFn: async () => {
            const record = await getRecord(client, {
              address: worldAddress,
              table: worldTables.UserDelegationControl,
              key: { delegator: userAddress, delegatee: appAccountAddress },
            });
            return record.delegationControlId === unlimitedDelegationControlId;
          },
        }
      : { queryKey, enabled: false },
  );
}
