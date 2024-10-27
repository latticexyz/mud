import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAllowance } from "./getAllowance";

export function getAllowanceQueryOptions({
  client,
  paymasterAddress,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  paymasterAddress: Address;
  userAddress: Address | undefined;
}) {
  const queryKey = ["getAllowance", client?.chain.id, paymasterAddress, userAddress];
  return queryOptions(
    client && userAddress
      ? {
          queryKey,
          queryFn: () => getAllowance({ client, paymasterAddress, userAddress }),
        }
      : { queryKey, enabled: false },
  );
}

export function useAllowance(userAddress: Address | undefined) {
  const { chainId, paymasterAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getAllowanceQueryOptions({ client, paymasterAddress, userAddress }));
}
