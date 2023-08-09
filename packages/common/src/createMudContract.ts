import {
  Abi,
  Account,
  Address,
  Chain,
  EstimateContractGasParameters,
  GetContractParameters,
  GetContractReturnType,
  Hex,
  PublicClient,
  SimulateContractParameters,
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

type CreateMudContractOptions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TAbi extends Abi | readonly unknown[] = Abi,
  TPublicClient extends PublicClient<TTransport, TChain> | unknown = unknown,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount> | unknown = unknown,
  TAddress extends Address = Address
> = Required<GetContractParameters<TTransport, TChain, TAccount, TAbi, TPublicClient, TWalletClient, TAddress>>;

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
}: CreateMudContractOptions<
  TTransport,
  TChain,
  TAccount,
  TAbi,
  TPublicClient,
  TWalletClient,
  TAddress
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

    // Concurrency of one means transactions will be queued and inserted into the mem pool synchronously and in order.
    // Although increasing this will allow for more parallel requests/transactions and nonce errors will get automatically retried,
    // we can't guarantee local nonce accurancy due to needing async operations (simulate) before incrementing the nonce.
    const queue = new pQueue({ concurrency: 1 });

    // Replace write calls with our own proxy. Implemented ~the same as viem, but adds better handling of nonces (via queue + retries).
    contract.write = new Proxy(
      {},
      {
        get(_, functionName: string): GetContractReturnType<Abi, PublicClient, WalletClient>["write"][string] {
          return async (...parameters) => {
            const { args, options } = getFunctionParameters(parameters as any);

            async function write(): Promise<Hex> {
              if (!nonceManager.hasNonce()) {
                await nonceManager.resetNonce();
              }

              debug("simulating write", functionName, args, options);
              const { request } = await publicClient.simulateContract({
                account: walletClient.account,
                address,
                abi,
                functionName,
                args,
                ...options,
              } as unknown as SimulateContractParameters<TAbi, typeof functionName, TChain>);

              const nonce = nonceManager.nextNonce();
              debug("calling write function with nonce", nonce, request);
              const result = await walletClient.writeContract({
                nonce,
                ...request,
              } as unknown as WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>);

              return result;
            }

            return await queue.add(
              () =>
                pRetry(write, {
                  retries: 3,
                  onFailedAttempt: async (error) => {
                    // On nonce errors, reset the nonce and retry
                    if (nonceManager.shouldResetNonce(error)) {
                      debug("got nonce error, retrying", error);
                      await nonceManager.resetNonce();
                      return;
                    }
                    throw error;
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
