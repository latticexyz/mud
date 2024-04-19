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
import { getFeeRef } from "@latticexyz/common";
import pRetry from "p-retry";
import { sendUserOperation as sendUserOperationBundler } from "permissionless/actions";

export type SendTransactionWithPaymasterParameters<
  entryPoint extends EntryPoint,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount<entryPoint> | undefined = SmartAccount<entryPoint> | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = SendTransactionParameters<TChain, TAccount, TChainOverride> & Middleware<entryPoint>;

export type WriteContractExtraOptions = {
  estimateFeesPerGas?: () => Promise<EstimateFeesPerGasReturnType>;
};

/**
 * Override sendTransaction with smart account handling.
 * Note: no guaranteed order since a unique `key` is used for every smart account nonce.
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

  // Refetch the current fees independently of sending user ops to reduce latency
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

  return pRetry(
    async () => {
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

      // We use Date.now() as `key` for the smart account nonce.
      // Using only `key` allows us to send multiple user operations to the bundler and be included in the same block,
      // but there is no guaranteed ordering of the user operations.
      userOperation.nonce = nonce ? BigInt(nonce) : BigInt(Date.now()) << 64n;

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

      const userOperationTransactionHash = await getAction(
        client,
        waitForUserOperationTransactionHash,
        "waitForUserOperationTransactionHash",
      )({
        hash: userOpHash,
        timeout: 10_000,
      });

      return userOperationTransactionHash.transactionHash;
    },
    {
      retries: 3,
      onFailedAttempt: async (error) => {
        // TODO: any case in which we should retry?
        throw error;
      },
    },
  );
}
