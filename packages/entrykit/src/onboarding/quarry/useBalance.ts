import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { getBalance } from "../../quarry/getBalance";

export function getBalanceQueryOptions({
  client,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
}) {
  return queryOptions({
    queryKey: ["getBalance", client?.uid, userAddress],
    queryFn: client && userAddress ? () => getBalance({ client, userAddress }) : skipToken,
  });
}

export function useBalance(userAddress: Address | undefined) {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getBalanceQueryOptions({ client, userAddress }));
}
