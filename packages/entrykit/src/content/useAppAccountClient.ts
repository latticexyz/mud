import { Account, Chain, Client, Transport } from "viem";
import { toCoinbaseSmartAccount } from "../smart-account/toCoinbaseSmartAccount";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useClient, useConnectorClient } from "wagmi";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getAppSigner } from "./getAppSigner";
import { createSmartAccountClient } from "permissionless/clients";

// TODO: lift out to somewhere else
const clientOpts = { pollingInterval: 1000 } as const;

export function useAppAccountClient(): UseQueryResult<Client<Transport, Chain, Account>> {
  const { chainId, bundlerTransport, paymasterAddress } = useEntryKitConfig();
  const client = useClient({ chainId });

  const { data: userClient, error: userClientError } = useConnectorClient({ chainId });
  if (userClientError) console.error("Error retrieving user client", userClientError);

  const queryKey = ["appAccountClient", client?.uid, userClient?.uid, userClient?.account.address];
  return useQuery(
    client && userClient
      ? {
          queryKey,
          queryFn: async () => {
            const appSigner = getAppSigner(userClient.account.address);
            const account = await toCoinbaseSmartAccount({ client, owners: [appSigner] });

            return createSmartAccountClient({
              bundlerTransport,
              client,
              account,
              ...clientOpts,
              // TODO: lift out to somewhere else
              paymaster: {
                getPaymasterData: async () => ({
                  paymaster: paymasterAddress,
                  paymasterData: "0x",
                }),
              },
              // TODO: lift out to somewhere else
              userOperation: {
                estimateFeesPerGas:
                  // anvil hardcodes fee returned by `eth_maxPriorityFeePerGas`
                  // so we have to override it here
                  // https://github.com/foundry-rs/foundry/pull/8081#issuecomment-2402002485
                  client.chain.id === 31337
                    ? async () => ({
                        maxFeePerGas: 100_000n,
                        maxPriorityFeePerGas: 0n,
                      })
                    : undefined,
              },
            });
          },
        }
      : { queryKey, enabled: false },
  );
}
