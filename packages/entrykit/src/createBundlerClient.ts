import { Transport, Chain, Client, RpcSchema, Address } from "viem";
import {
  BundlerClient,
  BundlerClientConfig,
  SmartAccount,
  createBundlerClient as viem_createBundlerClient,
} from "viem/account-abstraction";
import { defaultClientConfig } from "./common";

export function createBundlerClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>({
  paymasterAddress,
  ...config
}: BundlerClientConfig<transport, chain, account, client, rpcSchema> & { paymasterAddress: Address }): BundlerClient<
  transport,
  chain,
  account,
  client,
  rpcSchema
> {
  return viem_createBundlerClient({
    ...defaultClientConfig,
    paymaster: {
      getPaymasterData: async () => ({
        paymaster: paymasterAddress,
        paymasterData: "0x",
      }),
    },
    ...config,
  });
}
