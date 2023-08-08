import {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  GetContractReturnType,
  Hex,
  PublicClient,
  Transport,
  WalletClient,
  WriteContractParameters,
  getContract,
} from "viem";
import pQueue from "p-queue";
import pRetry from "p-retry";
import { createNonceManager } from "./createNonceManager";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("createNonceManager");

// copied from viem because it isn't exported
// TODO: import from viem?
function getFunctionParameters(values: [args?: readonly unknown[], options?: object]): {
  args: readonly unknown[];
  options: object;
} {
  const hasArgs = values.length && Array.isArray(values[0]);
  const args = hasArgs ? values[0]! : [];
  const options = (hasArgs ? values[1] : values[0]) ?? {};
  return { args, options };
}

export function createMudContract<
  TTransport extends Transport,
  TAddress extends Address,
  TAbi extends Abi,
  TChain extends Chain,
  TAccount extends Account,
  TPublicClient extends PublicClient<TTransport, TChain>,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount>
>({
  abi,
  address,
  publicClient,
  walletClient,
}: Required<
  GetContractParameters<TTransport, TChain, TAccount, TAbi, TPublicClient, TWalletClient, TAddress>
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress> {
  const contract = getContract<TTransport, TAddress, TAbi, TChain, TAccount, TPublicClient, TWalletClient>({
    abi,
    address,
    publicClient,
    walletClient,
  }) as unknown as GetContractReturnType<Abi, PublicClient, WalletClient>;

  if (contract.write) {
    const nonceManager = createNonceManager({
      publicClient: publicClient as PublicClient,
      address: walletClient.account.address,
    });

    // Concurrency of one means transactions will be queued and inserted into the mem pool in synchronously and in order.
    // You can increase the concurrency number for faster processing of transactions, but you risk getting nonce errors.
    // Nonce errors will get automatically retried, but may have unintended side effects.
    const queue = new pQueue({ concurrency: 1 });

    // Replace write calls with our own proxy. Implemented ~the same as viem, but adds better handling of nonces (via queue + retries).
    contract.write = new Proxy(
      {},
      {
        get(_, functionName: string): GetContractReturnType<Abi, PublicClient, WalletClient>["write"][string] {
          return async (...parameters) => {
            const { args, options } = getFunctionParameters(parameters as any);

            if (!nonceManager.hasNonce()) {
              await nonceManager.resetNonce();
            }

            async function write(): Promise<Hex> {
              const nonce = nonceManager.nextNonce();

              debug("calling write function", functionName, args, { nonce, ...options });
              const result = await walletClient.writeContract({
                abi,
                address,
                functionName,
                args,
                nonce,
                ...options,
              } as unknown as WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>);

              return result;
            }

            return await queue.add(
              () =>
                pRetry(write, {
                  retries: 5,
                  onFailedAttempt: async (error) => {
                    if (nonceManager.shouldResetNonce(error)) {
                      debug("got nonce error, retrying", error);
                      await nonceManager.resetNonce();
                    }
                  },
                }),
              { throwOnTimeout: true }
            );
          };
        },
      }
    );
  }

  return contract as unknown as GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress>;
}
