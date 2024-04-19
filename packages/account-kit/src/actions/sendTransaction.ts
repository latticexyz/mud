import { AccountOrClientNotFoundError, UserOperation } from "permissionless";
import { Middleware, prepareUserOperationRequest } from "permissionless/actions/smartAccount";
import { EntryPoint, GetEntryPointVersion } from "permissionless/types/entrypoint";
import { SmartAccount } from "permissionless/accounts";
import type {
  Chain,
  Client,
  EstimateFeesPerGasReturnType,
  FeeValuesEIP1559,
  Hash,
  SendTransactionParameters,
  Transport,
} from "viem";
import { Prettify } from "viem/chains";
import { getAction, parseAccount } from "viem/utils";
import { waitForUserOperationTransactionHash } from "./waitForUserOperationTransactionHash";
import { getNonceManager } from "@latticexyz/common";
import { getFeeRef } from "@latticexyz/common";
import pRetry from "p-retry";
import { debug } from "../debug";
import { sendUserOperation as sendUserOperationBundler } from "permissionless/actions";

export type SendTransactionWithPaymasterParameters<
  entryPoint extends EntryPoint,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount<entryPoint> | undefined = SmartAccount<entryPoint> | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = SendTransactionParameters<TChain, TAccount, TChainOverride> & Middleware<entryPoint>;

export type WriteContractExtraOptions = {
  /**
   * Adjust the number of concurrent calls to the mempool. This defaults to `1` to ensure transactions are ordered
   * and nonces are handled properly. Any number greater than that is likely to see nonce errors and/or transactions
   * arriving out of order, but this may be an acceptable trade-off for some applications that can safely retry.
   * @default 1
   */
  queueConcurrency?: number;
  estimateFeesPerGas?: () => Promise<EstimateFeesPerGasReturnType>;
};

/**
 * Creates, signs, and sends a new transaction to the network.
 * This function also allows you to sponsor this transaction if sender is a smartAccount
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash.
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction<
  TChain extends Chain | undefined,
  TAccount extends SmartAccount<entryPoint> | undefined,
  entryPoint extends EntryPoint,
  TChainOverride extends Chain | undefined = Chain | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: Prettify<SendTransactionWithPaymasterParameters<entryPoint, TChain, TAccount, TChainOverride>>,
  opts: WriteContractExtraOptions = {},
): Promise<Hash> {
  const {
    account: account_ = client.account,
    data,
    maxFeePerGas,
    maxPriorityFeePerGas,
    to,
    value,
    nonce,
    middleware,
  } = args;

  if (!account_) {
    throw new AccountOrClientNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransaction",
    });
  }

  const account = parseAccount(account_) as SmartAccount<entryPoint>;

  if (!to) throw new Error("Missing to address");

  if (account.type !== "local") {
    throw new Error("RPC account type not supported");
  }

  const nonceManager = await getNonceManager({
    client,
    address: account.address,
    queueConcurrency: opts.queueConcurrency,
  });

  console.log("queue concurrency", opts.queueConcurrency);

  const feeRef = await getFeeRef({
    client,
    refreshInterval: 10000,
    args: { chain: client.chain },
    estimateFeesPerGas: opts.estimateFeesPerGas,
  });

  const callData = await account.encodeCallData({
    to,
    value: value || BigInt(0),
    data: data || "0x",
  });

  return nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          if (!nonceManager.hasNonce()) {
            await nonceManager.resetNonce();
          }

          // const userOpHash = await getAction(
          //   client,
          // sendUserOperation<entryPoint>,
          //   "sendUserOperation",
          // )({
          //   userOperation: {
          //     sender: account.address,
          //     maxFeePerGas: maxFeePerGas ?? (feeRef.fees as FeeValuesEIP1559).maxFeePerGas ?? BigInt(0),
          //     maxPriorityFeePerGas:
          //       maxPriorityFeePerGas ?? (feeRef.fees as FeeValuesEIP1559).maxPriorityFeePerGas ?? BigInt(0),
          //     callData: callData,
          //     nonce: BigInt(nonce ?? nonceManager.nextNonce()),
          //   },
          //   account: account,
          //   middleware,
          // });

          const { account: account_ = client.account } = args;
          if (!account_) throw new AccountOrClientNotFoundError();

          const account = parseAccount(account_) as SmartAccount<entryPoint>;

          const userOperation = await getAction(
            client,
            prepareUserOperationRequest<entryPoint>,
            "prepareUserOperationRequest",
          )({
            userOperation: {
              sender: account.address,
              maxFeePerGas: maxFeePerGas ?? (feeRef.fees as FeeValuesEIP1559).maxFeePerGas ?? BigInt(0),
              maxPriorityFeePerGas:
                maxPriorityFeePerGas ?? (feeRef.fees as FeeValuesEIP1559).maxPriorityFeePerGas ?? BigInt(0),
              callData: callData,
              nonce: nonce ? BigInt(nonce) : undefined,
            },
            account: account,
            middleware,
          });

          // TODO: using Date.now() as nonce is probably not a good idea
          userOperation.nonce = nonce ? BigInt(nonce) : BigInt(Date.now()) << 64n; // BigInt(nonceManager.nextNonce()) << 64n;

          userOperation.signature = await account.signUserOperation(
            userOperation as UserOperation<GetEntryPointVersion<entryPoint>>,
          );

          const userOpHash = await getAction(
            client,
            sendUserOperationBundler,
            "sendUserOperationBundler",
          )({
            userOperation: userOperation as UserOperation<GetEntryPointVersion<entryPoint>>,
            entryPoint: account.entryPoint,
          });

          console.log("sent user op with nonce", userOperation.nonce);

          const userOperationTransactionHash = await getAction(
            client,
            waitForUserOperationTransactionHash,
            "waitForUserOperationTransactionHash",
          )({
            hash: userOpHash,
            timeout: 10_000,
          });

          console.log("got tx hash for user op with nonce", userOperation.nonce);

          return userOperationTransactionHash.transactionHash;
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
