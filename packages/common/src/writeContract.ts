import {
  Abi,
  Account,
  Chain,
  Client,
  Transport,
  WriteContractParameters,
  WriteContractReturnType,
  ContractFunctionName,
  ContractFunctionArgs,
  PublicClient,
  getContractError,
  BaseError,
  NonceTooHighError,
  NonceTooLowError,
} from "viem";
import { getChainId, writeContract as viem_writeContract } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { parseAccount } from "viem/accounts";
import { getAction } from "viem/utils";
import PQueue from "p-queue";

const debug = parentDebug.extend("writeContract");

// TODO: create map based on chain ID + address
const mempoolQueue = new PQueue({ concurrency: 1 });

function shouldRetry(error: unknown): boolean {
  return (
    error instanceof BaseError &&
    error.walk((e) => e instanceof NonceTooLowError || e instanceof NonceTooHighError) != null
  );
}

export type WriteContractExtraOptions<chain extends Chain | undefined> = {
  /**
   * `publicClient` can be provided to be used in place of the extended viem client for making public action calls
   * (`getChainId`, `getTransactionCount`, `simulateContract`). This helps in cases where the extended
   * viem client is a smart account client, like in [permissionless.js](https://github.com/pimlicolabs/permissionless.js),
   * where the transport is the bundler, not an RPC.
   */
  publicClient?: PublicClient<Transport, chain>;
  /**
   * Adjust the number of concurrent calls to the mempool. This defaults to `1` to ensure transactions are ordered
   * and nonces are handled properly. Any number greater than that is likely to see nonce errors and/or transactions
   * arriving out of order, but this may be an acceptable trade-off for some applications that can safely retry.
   * @default 1
   */
  queueConcurrency?: number;
};

/** @deprecated Use `walletClient.extend(transactionQueue())` instead. */
export async function writeContract<
  chain extends Chain | undefined,
  account extends Account | undefined,
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  request: WriteContractParameters<abi, functionName, args, chain, account, chainOverride>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts: WriteContractExtraOptions<chain> = {},
): Promise<WriteContractReturnType> {
  const rawAccount = request.account ?? client.account;
  const account = rawAccount ? parseAccount(rawAccount) : null;

  return mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          debug("calling", request.functionName);
          try {
            return await getAction(client, viem_writeContract, "writeContract")(request);
          } catch (error) {
            // TODO: remove once viem handles this (https://github.com/wevm/viem/pull/2624)
            throw getContractError(error as BaseError, {
              abi: request.abi as Abi,
              address: request.address,
              args: request.args,
              docsPath: "/docs/contract/writeContract",
              functionName: request.functionName,
              sender: account?.address,
            });
          }
        },
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            // Always reset nonce on error because the nonce manager has already consumed the nonce.
            // TODO: remove this once viem adjusts API to increment only after successful consume callback
            if (account != null) {
              // TODO: add chain ID cache
              const chainId =
                request.chain?.id ?? client.chain?.id ?? (await getAction(client, getChainId, "getChainId")(client));
              if (account.nonceManager != null) {
                debug("got error, resetting nonce");
                account.nonceManager.reset({ address: account.address, chainId });
              }
            }

            // Check if we should retry (e.g. nonce errors), otherwise throw
            // TODO: upgrade p-retry and move this to shouldRetry option
            if (!shouldRetry(error)) {
              throw error;
            }
          },
        },
      ),
    { throwOnTimeout: true },
  );
}
