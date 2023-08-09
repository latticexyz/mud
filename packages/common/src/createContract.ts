import {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  GetContractReturnType,
  PublicClient,
  SimulateContractParameters,
  Transport,
  WalletClient,
  WriteContractParameters,
  getContract,
} from "viem";
import pRetry from "p-retry";
import { createNonceManager } from "./createNonceManager";
import { debug as parentDebug } from "./debug";
import { UnionOmit } from "./type-utils/common";

const debug = parentDebug.extend("createContract");

// copied from viem because this isn't exported
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

export function createContract<
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

    // Replace write calls with our own proxy. Implemented ~the same as viem, but adds better handling of nonces (via queue + retries).
    contract.write = new Proxy(
      {},
      {
        get(_, functionName: string): GetContractReturnType<Abi, PublicClient, WalletClient>["write"][string] {
          return async (...parameters) => {
            const { args, options } = <
              {
                args: unknown[];
                options: UnionOmit<WriteContractParameters, "abi" | "address" | "functionName" | "args">;
              }
            >getFunctionParameters(parameters as any);

            // Temporarily override base fee for our default anvil config
            // TODO: remove once https://github.com/wagmi-dev/viem/pull/963 is fixed
            // TODO: more specific mud foundry check? or can we safely assume anvil+mud will be block fee zero for now?
            if (
              walletClient.chain.id === 31337 &&
              options.maxFeePerGas == null &&
              options.maxPriorityFeePerGas == null
            ) {
              debug("assuming zero base fee for anvil chain");
              options.maxFeePerGas = 0n;
              options.maxPriorityFeePerGas = 0n;
            }

            async function prepareWrite(): Promise<
              WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>
            > {
              if (options.gas) {
                debug("gas provided, skipping simulate", functionName, args, options);
                return {
                  address,
                  abi,
                  functionName,
                  args,
                  ...options,
                } as unknown as WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>;
              }

              debug("simulating write", functionName, args, options);
              const { request } = await publicClient.simulateContract({
                address,
                abi,
                functionName,
                args,
                ...options,
                account: options.account ?? walletClient.account,
              } as unknown as SimulateContractParameters<TAbi, typeof functionName, TChain>);

              return request as unknown as WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>;
            }

            const preparedWrite = await prepareWrite();

            return await pRetry(
              async () => {
                if (!nonceManager.hasNonce()) {
                  await nonceManager.resetNonce();
                }

                const nonce = nonceManager.nextNonce();
                debug("calling write function with nonce", nonce, preparedWrite);
                return await walletClient.writeContract({
                  nonce,
                  ...preparedWrite,
                });
              },
              {
                retries: 3,
                onFailedAttempt: async (error) => {
                  // On nonce errors, reset the nonce and retry
                  if (nonceManager.shouldResetNonce(error)) {
                    debug("got nonce error, retrying", error);
                    await nonceManager.resetNonce();
                    return;
                  }
                  // TODO: prepareWrite again if there are gas errors?
                  throw error;
                },
              }
            );
          };
        },
      }
    );
  }

  return contract as unknown as GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress>;
}
