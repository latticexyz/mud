import { Transport, Chain, Client, RpcSchema, EstimateFeesPerGasReturnType } from "viem";
import {
  BundlerClient,
  BundlerClientConfig,
  SmartAccount,
  createBundlerClient as viem_createBundlerClient,
} from "viem/account-abstraction";
import { getPaymaster } from "./getPaymaster";
import { getAction } from "viem/utils";
import { estimateFeesPerGas } from "viem/actions";

export function createBundlerClient<
  transport extends Transport,
  chain extends Chain = Chain,
  account extends SmartAccount = SmartAccount,
  client extends Client = Client,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  config: BundlerClientConfig<transport, chain, account, client, rpcSchema>,
): BundlerClient<transport, chain, account, client, rpcSchema> {
  // our generics above enforce this, but `BundlerClientConfig` makes it optional again
  const client = config.client;
  if (!client) throw new Error("No `client` provided to `createBundlerClient`.");

  const chain = config.chain ?? client.chain;
  const paymaster = chain ? getPaymaster(chain) : undefined;

  // TODO: lift this out to make `createBundlerClient` configurable?
  return viem_createBundlerClient({
    paymaster: paymaster
      ? {
          getPaymasterData: async () => ({
            paymaster: paymaster.address,
            paymasterData: "0x",
          }),
        }
      : undefined,
    userOperation: {
      estimateFeesPerGas: createFeeEstimator(client),
    },
    ...config,
  });
}

function createFeeEstimator(client: Client): undefined | (() => Promise<EstimateFeesPerGasReturnType<"eip1559">>) {
  if (!client.chain) return;

  // anvil hardcodes fee returned by `eth_maxPriorityFeePerGas`
  // so we override it here to mimick our chains
  // https://github.com/foundry-rs/foundry/pull/8081#issuecomment-2402002485
  // TODO: move this to user op executor transport?
  if (client.chain.id === 31337) {
    return async () => ({ maxFeePerGas: 100_000n, maxPriorityFeePerGas: 0n });
  }

  // do our own fee calculation for redstone, garnet, pyrope chains
  // because viem sets fees way too high by default
  // https://github.com/wevm/viem/blob/253b1072ad9fe36a0e0491e173c85a6d69209ada/src/account-abstraction/actions/bundler/prepareUserOperation.ts#L436-L457
  if ([690, 17069, 695569].includes(client.chain.id)) {
    // TODO: move to fee ref or similar approach
    return () => getAction(client, estimateFeesPerGas, "estimateFeesPerGas")({ chain: client.chain });
  }
}
