import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { paymasterTables } from "../paymaster";
import { useClient } from "wagmi";
import { getRecord } from "../utils/getRecord";
import { useQuery } from "@tanstack/react-query";

export function getSpenderQueryKey({
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
  return ["spender", client?.chain.id, paymasterAddress, userAddress, sessionAddress];
}

export function useSpender(userAddress: Address | undefined, sessionAddress: Address | undefined) {
  const { chainId, paymasterAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  const queryKey = getSpenderQueryKey({ client, paymasterAddress, userAddress, sessionAddress });
  return useQuery(
    client && userAddress && sessionAddress
      ? {
          queryKey,
          queryFn: async () => {
            const record = await getRecord(client, {
              address: paymasterAddress,
              table: paymasterTables.Spender,
              key: { spender: sessionAddress },
            });
            return record.user.toLowerCase() === userAddress.toLowerCase();
          },
        }
      : { queryKey, enabled: false },
  );
}
