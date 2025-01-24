import { Transport, Chain, Client, RpcSchema } from "viem";
import {
  BundlerClient,
  BundlerClientConfig,
  SmartAccount,
  createBundlerClient as viem_createBundlerClient,
} from "viem/account-abstraction";
import { defaultClientConfig } from "./common";
import { getPaymaster } from "./getPaymaster";

const knownChainFees = new Set([
  // anvil hardcodes fee returned by `eth_maxPriorityFeePerGas`
  // so we have to override it here
  // https://github.com/foundry-rs/foundry/pull/8081#issuecomment-2402002485
  31337,
  // rhodolite
  17420,
  // garnet
  17069,
  // redstone
  690,
]);

export function createBundlerClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  config: BundlerClientConfig<transport, chain, account, client, rpcSchema>,
): BundlerClient<transport, chain, account, client, rpcSchema> {
  const chain = config.chain ?? config.client?.chain;
  const paymaster = chain ? getPaymaster(chain) : undefined;
  return viem_createBundlerClient({
    ...defaultClientConfig,
    paymaster: paymaster
      ? {
          getPaymasterData: async () => ({
            paymaster: paymaster.address,
            paymasterData: "0x",
          }),
        }
      : undefined,
    // TODO: figure out why viem isn't falling back to `chain.fees.estimateFeesPerGas` when this isn't set
    userOperation: {
      estimateFeesPerGas:
        // TODO: move this to gas estimator transport?
        chain && knownChainFees.has(chain.id)
          ? async () => ({
              maxFeePerGas: 100_000n,
              maxPriorityFeePerGas: 0n,
            })
          : undefined,
    },
    ...config,
  });
}
