import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useAppSigner } from "./useAppSigner";
import { SmartAccount } from "viem/account-abstraction";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";
import { toCoinbaseSmartAccount } from "./smart-account/toCoinbaseSmartAccount";

export function useAppAccount(): UseQueryResult<SmartAccount> {
  const { chainId } = useEntryKitConfig();
  // TODO: does this need to be a bundler client?
  const client = useClient({ chainId });
  const [appSigner] = useAppSigner();

  const queryKey = ["appAccount", client?.uid, appSigner?.address];
  return useQuery(
    client && appSigner
      ? {
          queryKey,
          queryFn: async (): Promise<SmartAccount> => {
            const owners = [appSigner];
            return await toCoinbaseSmartAccount({ client, owners });
          },
        }
      : { queryKey, enabled: false },
  );
}
