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
import { prepareTransactionRequest, writeContract as viem_writeContract } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";
import { getFeeRef } from "./getFeeRef";

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

  const chain = client.chain;
  if (!chain) {
    throw new Error("Client must be connected to a chain");
  }

  const defaultParameters = {
    chain,
    ...(chain.fees ? { type: "eip1559" } : {}),
  } satisfies Omit<WriteContractParameters, "address" | "abi" | "account" | "functionName">;

  const nonceManager = await getNonceManager({
    client: opts.publicClient ?? client,
    address: account.address,
    blockTag: "pending",
    queueConcurrency: opts.queueConcurrency,
  });

  const feeRef = getFeeRef({ client: opts.publicClient ?? client, refreshInterval: 10000 });

  async function prepare(): Promise<WriteContractParameters<abi, functionName, args, chain, account, chainOverride>> {
    if (request.gas) {
      debug("gas provided, skipping preparation", request.functionName, request.address);
      return request;
    }

    return prepareTransactionRequest(opts.publicClient ?? client, {
      // The nonce does not need to be accurate for gas estimation and we can save
      // one `eth_getTransactionCount` rpc call by providing a stub here
      nonce: 0,
      ...defaultParameters,
      ...request,
    } as never) as never;
  }

  return nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          // We estimate gas before increasing the local nonce to prevent nonce gaps.
          // Invalid transactions fail the gas estimation step are never submitted
          // to the network, so they should not increase the nonce.
          const preparedRequest = await prepare();

          if (!nonceManager.hasNonce()) {
            await nonceManager.resetNonce();
          }

          const nonce = nonceManager.nextNonce();
          const fullRequest = { ...preparedRequest, nonce, ...feeRef.fees };
          debug("calling", fullRequest.functionName, "with nonce", nonce, "at", fullRequest.address);
          return await viem_writeContract(client, fullRequest as never);
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
