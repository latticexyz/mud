import { useAccount, usePublicClient } from "wagmi";
import { publicActions, createClient, walletActions, createTransport } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useAppSigner } from "./useAppSigner";
import { AppAccountClient, defaultPollingInterval } from "./common";
import { transportObserver } from "./transportObserver";
import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useAppChain } from "./useAppChain";
import { transactionQueue } from "@latticexyz/common/actions";

export function useAppAccountClient(): UseQueryResult<AppAccountClient> {
  // TODO: add support for erc4337

  const [appSignerAccount] = useAppSigner();
  const { worldAddress } = useEntryKitConfig();
  const chain = useAppChain();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient({ chainId: chain.id });

  const queryKey = ["mud:appAccountClient", chain.id, worldAddress, appSignerAccount?.address, userAddress];

  return useQuery(
    appSignerAccount && userAddress && publicClient
      ? ({
          queryKey,
          staleTime: Infinity,
          queryFn: async () => {
            // We create our own client here so we can provide a custom client `type` that we'll use
            // later in the app to determine how deposits should work.
            const appAccountClient = createClient({
              type: "appSignerClient",
              // TODO: figure out what effect `key` has and how to use this option properly
              key: "appSignerClient",
              // TODO: figure out what effect `name` has and how to use this option properly
              name: "App Signer Client",
              chain,
              account: appSignerAccount,
              pollingInterval: defaultPollingInterval,
              // TODO: add websocket + fallback?
              // TODO: provide way to override this transport?
              transport: transportObserver("app signer account client", () => createTransport(publicClient.transport)),
            })
              .extend(publicActions)
              .extend(walletActions)
              .extend(transactionQueue())
              .extend(
                callFrom({
                  worldAddress,
                  delegatorAddress: userAddress,
                }),
              );
            return appAccountClient;
          },
        } satisfies UseQueryOptions)
      : {
          queryKey,
          enabled: false,
        },
  );
}
