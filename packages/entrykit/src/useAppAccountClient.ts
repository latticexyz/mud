import { Account, Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getAppAccountClient } from "./getAppAccountClient";

export function useAppAccountClient(
  userAddress: Address | undefined,
): UseQueryResult<Client<Transport, Chain, Account>> {
  const { chainId, bundlerTransport, paymasterAddress, worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  const queryKey = ["appAccountClient", client?.uid, userAddress];
  return useQuery(
    client && userAddress
      ? {
          queryKey,
          queryFn: async () => {
            return await getAppAccountClient({
              worldAddress,
              userAddress,
              client,
              bundlerTransport,
              paymasterAddress,
            });
          },
          staleTime: Infinity,
        }
      : { queryKey, enabled: false },
  );
}
