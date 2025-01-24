import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCallWithSignatureNonce } from "./getCallWithSignatureNonce";

export function getCallWithSignatureNonceQueryOptions({
  client,
  worldAddress,
  userAddress,
}: {
  client: Client<Transport, Chain> | undefined;
  worldAddress: Address;
  userAddress: Address | undefined;
}) {
  const queryKey = ["getCallWithSignatureNonce", client?.chain.id, worldAddress, userAddress];
  return queryOptions(
    client && userAddress
      ? {
          queryKey,
          queryFn: () => getCallWithSignatureNonce({ client, worldAddress, userAddress }),
        }
      : { queryKey, enabled: false },
  );
}

export function useCallWithSignatureNonce({
  worldAddress,
  userAddress,
}: {
  worldAddress: Address;
  userAddress: Address | undefined;
}) {
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  return useQuery(getCallWithSignatureNonceQueryOptions({ client, worldAddress, userAddress }));
}
