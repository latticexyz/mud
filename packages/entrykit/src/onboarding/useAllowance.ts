import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAllowance } from "../quarry/getAllowance";

export function getAllowanceQueryOptions({
  client,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
}) {
  const queryKey = ["getAllowance", client?.chain.id, userAddress];
  return queryOptions(
    client && userAddress
      ? {
          queryKey,
          queryFn: () => getAllowance({ client, userAddress }),
        }
      : { queryKey, enabled: false },
  );
}

export function useAllowance(userAddress: Address | undefined) {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getAllowanceQueryOptions({ client, userAddress }));
}
