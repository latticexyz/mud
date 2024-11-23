import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSpender } from "./getSpender";

export function getSpenderQueryOptions({
  client,
  paymasterAddress,
  userAddress,
  sessionAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  paymasterAddress: Address;
  userAddress: Address | undefined;
  sessionAddress: Address | undefined;
}) {
  const queryKey = ["getSpender", client?.chain.id, paymasterAddress, userAddress, sessionAddress];
  return queryOptions(
    client && userAddress && sessionAddress
      ? {
          queryKey,
          queryFn: () => getSpender({ client, paymasterAddress, userAddress, sessionAddress }),
        }
      : { queryKey, enabled: false },
  );
}

export function useSpender(userAddress: Address | undefined, sessionAddress: Address | undefined) {
  const { chainId, paymasterAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getSpenderQueryOptions({ client, paymasterAddress, userAddress, sessionAddress }));
}
