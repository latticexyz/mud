import { getUserOperationStatus } from "permissionless/actions/pimlico";
import { observe } from "./observe";
import { type Account, BaseError, type Chain, type Client, type Hash, type Transport, stringify } from "viem";
import { getAction } from "viem/utils";
import { waitForUserOperationReceipt } from "permissionless";

export class WaitForUserOperationReceiptTimeoutError extends BaseError {
  override name = "WaitForUserOperationReceiptTimeoutError";
  constructor({ hash }: { hash: Hash }) {
    super(`Timed out while waiting for transaction with hash "${hash}" to be confirmed.`);
  }
}

export type WaitForUserOperationTransactionHashParameters = {
  /** The hash of the user operation. */
  hash: Hash;
  /**
   * Polling frequency (in ms). Defaults to the client's pollingInterval config.
   * @default client.pollingInterval
   */
  pollingInterval?: number;
  /** Optional timeout (in milliseconds) to wait before stopping polling. */
  timeout?: number;
};

export type WaitForUserOperationTransactionHashReturnType = {
  /** The hash of the transaction. */
  transactionHash: Hash;
};

/**
 * Waits for `pimlico_getUserOperationStatus` to return a transaction hash.
 *
 *
 * @param client - Bundler Client to use
 * @param parameters - {@link WaitForUserOperationReceiptParameters}
 * @returns The transaction receipt. {@link GetUserOperationReceiptReturnType}
 *
 * @example
 * import { createBundlerClient, waitForUserOperationReceipt, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const userOperationReceipt = await waitForUserOperationReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export const waitForUserOperationTransactionHash = async <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  bundlerClient: Client<TTransport, TChain, TAccount>,
  { hash, pollingInterval = bundlerClient.pollingInterval, timeout }: WaitForUserOperationTransactionHashParameters,
): Promise<WaitForUserOperationTransactionHashReturnType> => {
  const observerId = stringify(["waitForUserOperationReceipt", bundlerClient.uid, hash]);

  const getUserOperationStatusPromise = new Promise((resolve, reject) => {
    const unobserve = observe(observerId, { resolve, reject }, async (emit) => {
      let timeoutTimer: ReturnType<typeof setTimeout>;

      const _removeInterval = setInterval(async () => {
        const done = (fn: () => void) => {
          clearInterval(_removeInterval);
          fn();
          unobserve();
          if (timeout) clearTimeout(timeoutTimer);
        };
        try {
          const _userOperationStatus = await getAction(
            bundlerClient,
            getUserOperationStatus,
            "getUserOperationStatus",
          )({ hash });

          if (_userOperationStatus.transactionHash !== null) {
            done(() => emit.resolve({ transactionHash: _userOperationStatus.transactionHash }));
            return;
          }

          // The only valid state in which the status doesn not include a tx hash is "not_submitted" or "not_found"
          if (_userOperationStatus.status !== "not_submitted" && _userOperationStatus.status !== "not_found") {
            done(() => emit.reject("Unexpected transaction status: " + _userOperationStatus.status));
          }
        } catch (err) {
          done(() => emit.reject(err));
          return;
        }
      }, pollingInterval);

      if (timeout) {
        timeoutTimer = setTimeout(() => {
          clearInterval(_removeInterval);
          unobserve();
          reject(
            new WaitForUserOperationReceiptTimeoutError({
              hash,
            }),
          );
          clearTimeout(timeoutTimer);
        }, timeout);
      }
    });
  });

  try {
    return (await getUserOperationStatusPromise) as WaitForUserOperationTransactionHashReturnType;
  } catch (e) {
    const result = await getAction(bundlerClient, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });
    return { transactionHash: result.receipt.transactionHash };
  }
};
