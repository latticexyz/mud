import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { getSpender } from "./getSpender";

export function getSpenderQueryOptions({
  client,
  userAddress,
  sessionAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  userAddress: Address | undefined;
  sessionAddress: Address | undefined;
}) {
  return queryOptions({
    queryKey: ["getSpender", client?.uid, userAddress, sessionAddress],
    queryFn:
      client && userAddress && sessionAddress ? () => getSpender({ client, userAddress, sessionAddress }) : skipToken,
  });
}

export function useSpender(userAddress: Address | undefined, sessionAddress: Address | undefined) {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getSpenderQueryOptions({ client, userAddress, sessionAddress }));
}
