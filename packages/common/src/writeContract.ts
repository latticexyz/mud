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
} from "viem";
import { writeContract as viem_writeContract } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";
import { getFeeRef } from "./getFeeRef";
import { getAction } from "viem/utils";

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
  const abi extends Abi | readonly unknown[],
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
  const chain = client.chain;

  const blockTag = "pending";
  const nonceManager = await getNonceManager({
    client: opts.publicClient ?? client,
    address: account.address,
    blockTag,
    queueConcurrency: opts.queueConcurrency,
  });

  const feeRef = await getFeeRef({
    client: opts.publicClient ?? client,
    refreshInterval: 10000,
    args: { chain },
  });

  return nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          const nonce = nonceManager.nextNonce();
          const params = {
            blockTag,
            ...request,
            nonce,
            ...feeRef.fees,
          } as const satisfies WriteContractParameters<abi, functionName, args, chain, account, chainOverride>;
          debug("calling", params.functionName, "at", params.address, "with nonce", nonce);
          return await getAction(client, viem_writeContract, "writeContract")(params as never);
        },
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            // in case this tx failed before hitting the mempool (i.e. gas estimation error), reset nonce so we don't skip past the unused nonce
            debug("failed, resetting nonce");
            await nonceManager.resetNonce();
            // retry nonce errors
            // TODO: upgrade p-retry and move this to shouldRetry
            if (nonceManager.shouldResetNonce(error)) {
              debug("got nonce error, retrying", error.message);
              return;
            }
            throw error;
          },
        },
      ),
    { throwOnTimeout: true },
  );
}
