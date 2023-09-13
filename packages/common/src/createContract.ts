import {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  GetContractReturnType,
  Hex,
  PublicClient,
  SimulateContractParameters,
  Transport,
  WalletClient,
  WriteContractParameters,
  encodeFunctionData,
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

export type ContractWrite = {
  id: string;
  request: WriteContractParameters;
  result: Promise<Hex>;
};

export type CreateContractOptions<
  TTransport extends Transport,
  TAddress extends Address,
  TAbi extends Abi,
  TChain extends Chain,
  TAccount extends Account,
  TPublicClient extends PublicClient<TTransport, TChain>,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount>
> = Required<GetContractParameters<TTransport, TChain, TAccount, TAbi, TPublicClient, TWalletClient, TAddress>> & {
  getResourceSelector: (functionName: string) => Promise<Hex>;
  onWrite?: (write: ContractWrite) => void;
};

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
  onWrite,
  getResourceSelector,
}: CreateContractOptions<
  TTransport,
  TAddress,
  TAbi,
  TChain,
  TAccount,
  TPublicClient,
  TWalletClient
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress> {
  const contract = getContract<TTransport, TAddress, TAbi, TChain, TAccount, TPublicClient, TWalletClient>({
    abi,
    address,
    publicClient,
    walletClient,
  }) as unknown as GetContractReturnType<Abi, PublicClient, WalletClient>;

  if (contract.write) {
    let nextWriteId = 0;
    const nonceManager = createNonceManager({
      publicClient: publicClient as PublicClient,
      address: walletClient.account.address,
    });

    // Replace write calls with our own proxy. Implemented ~the same as viem, but adds better handling of nonces (via queue + retries).
    contract.write = new Proxy(
      {},
      {
        get(_, functionName: string): GetContractReturnType<Abi, PublicClient, WalletClient>["write"][string] {
          async function prepareWrite(
            options: WriteContractParameters
          ): Promise<WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>> {
            if (options.gas) {
              debug("gas provided, skipping simulate", functionName, options);
              return options as unknown as WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>;
            }

            debug("simulating write", functionName, options);
            const { request } = await publicClient.simulateContract({
              ...options,
              account: options.account ?? walletClient.account,
            } as unknown as SimulateContractParameters<TAbi, typeof functionName, TChain>);

            return request as unknown as WriteContractParameters<TAbi, typeof functionName, TChain, TAccount>;
          }

          async function write(options: WriteContractParameters): Promise<Hex> {
            const preparedWrite = await prepareWrite(options);

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
          }

          return async (...parameters) => {
            const id = `${walletClient.chain.id}:${walletClient.account.address}:${nextWriteId++}`;
            const { args, options } = <
              {
                args: unknown[];
                options: UnionOmit<WriteContractParameters, "address" | "abi" | "functionName" | "args">;
              }
            >getFunctionParameters(parameters as any);
            const resourceSelector = await getResourceSelector(functionName);

            // TODO figure out how to strongly type this
            const funcSelectorAndArgs = encodeFunctionData<Abi, string>({
              abi,
              functionName: functionName,
              args,
            });
            const argsForCallFrom = [walletClient.account.address, resourceSelector, funcSelectorAndArgs]; // TODO replace address with delegator

            console.log({ argsForCallFrom, resourceSelector, funcSelectorAndArgs });
            const request: WriteContractParameters = {
              address,
              abi,
              functionName: "callFrom",
              args: argsForCallFrom,
              ...options,
            };

            const result = write(request);

            onWrite?.({ id, request, result });

            return result;
          };
        },
      }
    );
  }

  return contract as unknown as GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress>;
}
