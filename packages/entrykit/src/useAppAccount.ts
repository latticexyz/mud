import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useAppSigner } from "./useAppSigner";
import { SmartAccount, toCoinbaseSmartAccount } from "viem/account-abstraction";
import { useConfig } from "./EntryKitConfigProvider";
import { useClient } from "wagmi";

export function useAppAccount(): UseQueryResult<SmartAccount> {
  const { chainId } = useConfig();
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
            return await toCoinbaseSmartAccount({
              client,
              owners,
              // populate address here so it doesn't have to be fetched repeatedly
              // TODO: simplify after https://github.com/wevm/viem/pull/2820
              address: (await toCoinbaseSmartAccount({ client, owners })).address,
            });
          },
        }
      : { queryKey, enabled: false },
  );
}
