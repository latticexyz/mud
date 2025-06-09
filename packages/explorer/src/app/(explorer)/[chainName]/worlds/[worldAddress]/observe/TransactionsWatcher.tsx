import { useParams } from "next/navigation";
import {
  Address,
  BaseError,
  Hash,
  Transaction,
  TransactionReceipt,
  decodeFunctionData,
  getAddress,
  parseAbi,
  parseEventLogs,
} from "viem";
import { UserOperation, entryPoint07Abi, entryPoint07Address } from "viem/account-abstraction";
import { useConfig, useWatchBlocks } from "wagmi";
import { getBlock, getTransaction, simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { useStore } from "zustand";
import { useCallback, useEffect } from "react";
import { store as observerStore } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { store as worldStore } from "../store";
import { userOperationEventAbi } from "./abis/userOperationEventAbi";
import { getDecodedUserOperationCalls } from "./utils/getDecodedUserOperationCalls";

export function TransactionsWatcher() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams<{ worldAddress: Address }>();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const { transactions, setTransaction, updateTransaction } = useStore(worldStore);
  const observerWrites = useStore(observerStore, (state) => state.writes);

  const handleUserOperation = useCallback(
    ({
      hash,
      writeId,
      timestamp,
      receipt,
      transaction,
      userOperation,
    }: {
      hash: Hash;
      writeId?: string;
      timestamp: bigint;
      receipt: TransactionReceipt;
      transaction: Transaction;
      userOperation: UserOperation<"0.7">;
    }) => {
      if (!abi) return;

      const decodedSmartAccountCall = decodeFunctionData({
        abi: parseAbi([
          "function execute(address target, uint256 value, bytes calldata data)",
          "function executeBatch((address target,uint256 value,bytes data)[])",
        ]),
        data: userOperation.callData,
      });

      const { functionName: decodedFunctionName, args: decodedArgs } = decodedSmartAccountCall;
      const calls = getDecodedUserOperationCalls({
        abi,
        functionName: decodedFunctionName,
        decodedArgs,
      }).filter(({ to }) => to && getAddress(to) === getAddress(worldAddress));
      if (calls.length === 0) return;

      const logs = parseEventLogs({
        abi: [...abi, userOperationEventAbi],
        logs: receipt.logs,
      });
      const userOperationEvent = logs.find(({ eventName }) => eventName === "UserOperationEvent");

      setTransaction({
        hash,
        writeId: writeId ?? hash,
        from: calls[0]?.from ?? transaction.from,
        timestamp,
        transaction,
        calls,
        receipt,
        logs,
        value: transaction.value,
        status:
          userOperationEvent && "success" in userOperationEvent.args
            ? userOperationEvent.args.success
              ? "success"
              : "reverted"
            : "reverted",
      });
    },
    [abi, setTransaction, worldAddress],
  );

  const handleUserOperations = useCallback(
    async ({ writeId, timestamp, transaction }: { writeId?: string; timestamp: bigint; transaction: Transaction }) => {
      if (!abi) return;

      const hash = transaction.hash;
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: transaction.hash });
      const decodedEntryPointCall = decodeFunctionData({
        abi: entryPoint07Abi,
        data: transaction.input,
      });

      const userOperations = decodedEntryPointCall.args[0] as never as UserOperation<"0.7">[];
      for (const userOperation of userOperations) {
        handleUserOperation({ hash, writeId, timestamp, receipt, transaction, userOperation });
      }
    },
    [abi, handleUserOperation, wagmiConfig],
  );

  const handleAuthenticTransaction = useCallback(
    async ({
      writeId,
      hash,
      timestamp,
      transaction,
    }: {
      hash: Hash;
      writeId?: string;
      timestamp: bigint;
      transaction: Transaction;
    }) => {
      if (!abi || !transaction.to) return;

      let functionName: string | undefined;
      let args: readonly unknown[] | undefined;
      let transactionError: BaseError | undefined;

      try {
        const functionData = decodeFunctionData({ abi, data: transaction.input });
        functionName = functionData.functionName;
        args = functionData.args;
      } catch (error) {
        transactionError = error as BaseError;
        functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
      }

      setTransaction({
        hash,
        writeId: writeId ?? hash,
        from: transaction.from,
        timestamp,
        transaction,
        status: "pending",
        calls: [
          {
            to: transaction.to,
            functionName,
            args,
          },
        ],
        value: transaction.value,
      });

      let receipt: TransactionReceipt | undefined;
      try {
        receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      } catch {
        console.error(`Failed to fetch transaction receipt. Transaction hash: ${hash}`);
      }

      if (receipt && receipt.status === "reverted" && functionName) {
        try {
          // Simulate the failed transaction to retrieve the revert reason
          // Note, it only works for functions that are declared in the ABI
          // See: https://github.com/wevm/viem/discussions/462
          await simulateContract(wagmiConfig, {
            account: transaction.from,
            address: worldAddress,
            abi,
            value: transaction.value,
            blockNumber: receipt.blockNumber,
            functionName,
            args,
          });
        } catch (error) {
          transactionError = error as BaseError;
        }
      }

      const status = receipt ? receipt.status : "unknown";
      const logs = parseEventLogs({
        abi,
        logs: receipt?.logs || [],
      });

      updateTransaction(hash, {
        receipt,
        logs,
        status,
        error: transactionError as BaseError,
      });
    },
    [abi, wagmiConfig, worldAddress, setTransaction, updateTransaction],
  );

  const handleTransaction = useCallback(
    async ({ hash, writeId, timestamp }: { hash: Hash; timestamp: bigint; writeId?: string }) => {
      if (!abi) return;

      const transaction = await getTransaction(wagmiConfig, { hash, chainId });
      if (transaction.to && getAddress(transaction.to) === getAddress(entryPoint07Address)) {
        handleUserOperations({ writeId, timestamp, transaction });
      } else if (transaction.to && getAddress(transaction.to) === getAddress(worldAddress)) {
        handleAuthenticTransaction({ hash, writeId, timestamp, transaction });
      }
    },
    [abi, wagmiConfig, chainId, worldAddress, handleUserOperations, handleAuthenticTransaction],
  );

  useEffect(() => {
    for (const { hash, writeId, time } of Object.values(observerWrites)) {
      if (hash) {
        const transaction = transactions.find((transaction) => transaction.hash === hash);
        if (!transaction) {
          handleTransaction({ hash, writeId, timestamp: BigInt(time) / 1000n });
        }
      }
    }
  }, [handleTransaction, observerWrites, transactions, worldAddress]);

  useWatchBlocks({
    chainId,
    async onBlock(block) {
      // workaround for https://github.com/wevm/viem/issues/2995
      // TODO: remove once fixed and we upgrade viem
      const blockTxs =
        block.transactions ?? (await getBlock(wagmiConfig, { chainId, blockHash: block.hash })).transactions;
      for (const hash of blockTxs) {
        if (transactions.find((transaction) => transaction.hash === hash)) continue;
        handleTransaction({ hash, timestamp: block.timestamp });
      }
    },
  });

  return null;
}
