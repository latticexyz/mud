import {
  Account,
  CallParameters,
  Chain,
  Client,
  SendTransactionParameters,
  Transport,
  SendTransactionReturnType,
  PublicClient,
} from "viem";
import { call, sendTransaction as viem_sendTransaction } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";
import { getFeeRef } from "./getFeeRef";

const debug = parentDebug.extend("sendTransaction");

export type SendTransactionExtraOptions<chain extends Chain | undefined> = {
  /**
   * `publicClient` can be provided to be used in place of the extended viem client for making public action calls
   * (`getChainId`, `getTransactionCount`, `call`). This helps in cases where the extended
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
export async function sendTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  request: SendTransactionParameters<chain, account, chainOverride>,
  opts: SendTransactionExtraOptions<chain> = {},
): Promise<SendTransactionReturnType> {
  const rawAccount = request.account ?? client.account;
  if (!rawAccount) {
    // TODO: replace with viem AccountNotFoundError once its exported
    throw new Error("No account provided");
  }
  const account = parseAccount(rawAccount);
  const chain = client.chain;

  const nonceManager = await getNonceManager({
    client: opts.publicClient ?? client,
    address: account.address,
    blockTag: "pending",
    queueConcurrency: opts.queueConcurrency,
  });

  const feeRef = await getFeeRef({
    client: opts.publicClient ?? client,
    refreshInterval: 10000,
    args: { chain },
  });

  async function prepare(): Promise<SendTransactionParameters<chain, account, chainOverride>> {
    if (request.gas) {
      debug("gas provided, skipping simulate", request.to);
      return request;
    }

    debug("simulating tx to", request.to);
    await call(opts.publicClient ?? client, {
      ...request,
      blockTag: "pending",
      account,
    } as CallParameters<chain>);

    return request;
  }

  return await nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          const preparedRequest = await prepare();

          if (!nonceManager.hasNonce()) {
            await nonceManager.resetNonce();
          }

          const nonce = nonceManager.nextNonce();
          debug("sending tx with nonce", nonce, "to", preparedRequest.to);
          const parameters: SendTransactionParameters<chain, account, chainOverride> = {
            ...preparedRequest,
            nonce,
            ...feeRef.fees,
          };
          return await viem_sendTransaction(client, parameters);
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
            // TODO: prepare again if there are gas errors?
            throw error;
          },
        },
      ),
    { throwOnTimeout: true },
  );
}
