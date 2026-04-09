import { Transport, Chain, Client, RpcSchema, EstimateFeesPerGasReturnType } from "viem";
import {
  BundlerClient,
  BundlerClientConfig,
  SmartAccount,
  createBundlerClient as viem_createBundlerClient,
} from "viem/account-abstraction";
import { defaultClientConfig } from "./common";
import { getPaymaster } from "./getPaymaster";
import { cachedFeesPerGas } from "./actions/cachedFeesPerGas";

const cachedFeeChainIds = new Set([
  690, // Redstone
  17069, // Garnet
  695569, // Pyrope
  55377, // DUST testnet
  55378, // DUST mainnet
]);

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
    ...defaultClientConfig,
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

  // Cache viem's default EIP-1559 fee estimation on chains where fee RPC latency
  // is a material part of AA preparation time.
  // This still uses viem's normal fee logic, but avoids repeating the public RPC
  // `eth_getBlockByNumber` + `eth_maxPriorityFeePerGas` calls on every action.
  // https://github.com/wevm/viem/blob/3aa882692d2c4af3f5e9cc152099e07cde28e551/src/actions/public/estimateFeesPerGas.ts#L132
  if (cachedFeeChainIds.has(client.chain.id)) {
    return cachedFeesPerGas(client);
  }
}
