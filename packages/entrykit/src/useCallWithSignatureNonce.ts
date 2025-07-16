import { Address, Chain, Client, Transport } from "viem";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
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
  return queryOptions({
    queryKey: ["getCallWithSignatureNonce", client?.chain.id, worldAddress, userAddress],
    queryFn: client && userAddress ? () => getCallWithSignatureNonce({ client, worldAddress, userAddress }) : skipToken,
  });
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
