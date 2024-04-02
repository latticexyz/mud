import {
  Abi,
  Account,
  Chain,
  Client,
  SimulateContractParameters,
  Transport,
  WriteContractParameters,
  WriteContractReturnType,
  ContractFunctionName,
  ContractFunctionArgs,
  PublicClient,
} from "viem";
import { simulateContract, writeContract as viem_writeContract } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";

const debug = parentDebug.extend("writeContract");

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
   * and nonces are handled properly. Any number greater than that is likely to see nonce errors, but this may be
   * an acceptable trade-off for some applications that can safely retry.
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
  opts: WriteContractExtraOptions<chain> = {},
): Promise<WriteContractReturnType> {
  const rawAccount = request.account ?? client.account;
  if (!rawAccount) {
    // TODO: replace with viem AccountNotFoundError once its exported
    throw new Error("No account provided");
  }
  const account = parseAccount(rawAccount);

  const nonceManager = await getNonceManager({
    client: opts.publicClient ?? client,
    address: account.address,
    blockTag: "pending",
    queueConcurrency: opts.queueConcurrency,
  });

  async function prepareWrite(): Promise<
    WriteContractParameters<abi, functionName, args, chain, account, chainOverride>
  > {
    if (request.gas) {
      debug("gas provided, skipping simulate", request.functionName, request.address);
      return request;
    }

    debug("simulating", request.functionName, "at", request.address);
    const result = await simulateContract<chain, account | undefined, abi, functionName, args, chainOverride>(
      opts.publicClient ?? client,
      {
        ...request,
        blockTag: "pending",
        account,
      } as unknown as SimulateContractParameters<abi, functionName, args, chain, chainOverride>,
    );

    return result.request as unknown as WriteContractParameters<abi, functionName, args, chain, account, chainOverride>;
  }

  return nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          const preparedWrite = await prepareWrite();

          if (!nonceManager.hasNonce()) {
            await nonceManager.resetNonce();
          }

          const nonce = nonceManager.nextNonce();
          debug("calling", preparedWrite.functionName, "with nonce", nonce, "at", preparedWrite.address);
          return await viem_writeContract(client, {
            nonce,
            ...preparedWrite,
          } as typeof preparedWrite);
        },
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            // On nonce errors, reset the nonce and retry
            if (nonceManager.shouldResetNonce(error)) {
              debug("got nonce error, retrying", error.message);
              await nonceManager.resetNonce();
              return;
            }
            // TODO: prepareWrite again if there are gas errors?
            throw error;
          },
        },
      ),
    { throwOnTimeout: true },
  );
}
