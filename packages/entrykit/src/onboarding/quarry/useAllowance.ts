import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { getAllowance } from "../../quarry/getAllowance";

export function getAllowanceQueryOptions({
  client,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
}) {
  return queryOptions({
    queryKey: ["getAllowance", client?.uid, userAddress],
    queryFn: client && userAddress ? () => getAllowance({ client, userAddress }) : skipToken,
  });
}

export function useAllowance(userAddress: Address | undefined) {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getAllowanceQueryOptions({ client, userAddress }));
}
