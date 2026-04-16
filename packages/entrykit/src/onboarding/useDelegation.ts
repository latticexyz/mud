import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
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
  return queryOptions({
    queryKey: ["getDelegation", client?.uid, worldAddress, userAddress, sessionAddress],
    queryFn:
      client && userAddress && sessionAddress
        ? () => getDelegation({ client, worldAddress, userAddress, sessionAddress })
        : skipToken,
  });
}

export function useDelegation(userAddress: Address | undefined, sessionAddress: Address | undefined) {
  const { chainId, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getDelegationQueryOptions({ client, worldAddress, userAddress, sessionAddress }));
}
