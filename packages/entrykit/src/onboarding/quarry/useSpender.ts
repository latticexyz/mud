import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, useQuery } from "@tanstack/react-query";
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
  const queryKey = ["getSpender", client?.uid, userAddress, sessionAddress];
  return queryOptions(
    client && userAddress && sessionAddress
      ? {
          queryKey,
          queryFn: () => getSpender({ client, userAddress, sessionAddress }),
        }
      : { queryKey, enabled: false },
  );
}

export function useSpender(userAddress: Address | undefined, sessionAddress: Address | undefined) {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getSpenderQueryOptions({ client, userAddress, sessionAddress }));
}
