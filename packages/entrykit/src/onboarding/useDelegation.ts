import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getDelegation } from "./getDelegation";

export function getDelegationQueryOptions({
  client,
  worldAddress,
  userAddress,
  sessionAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  worldAddress: Address;
  userAddress: Address | undefined;
  sessionAddress: Address | undefined;
}) {
  const queryKey = ["getDelegation", client?.chain.id, worldAddress, userAddress, sessionAddress];
  return queryOptions(
    client && userAddress && sessionAddress
      ? {
          queryKey,
          queryFn: () => getDelegation({ client, worldAddress, userAddress, sessionAddress }),
        }
      : { queryKey, enabled: false },
  );
}

export function useDelegation(userAddress: Address | undefined, sessionAddress: Address | undefined) {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress }));
}
