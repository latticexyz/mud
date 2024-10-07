import { useParams } from "next/navigation";
import {
  AbiFunction,
  Address,
  BaseError,
  DecodeFunctionDataReturnType,
  Hex,
  Log,
  Transaction,
  TransactionReceipt,
  decodeFunctionData,
  parseAbiItem,
  parseEventLogs,
} from "viem";
import { useConfig, useWatchBlocks } from "wagmi";
import { useStore } from "zustand";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTransaction, simulateContract, waitForTransactionReceipt } from "@wagmi/core";
import { Message } from "../../../../../../observer/messages";
import { Write, store } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";

export type WatchedTransaction = {
  from?: Address;
  timestamp?: bigint;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  value?: bigint;
  receipt?: TransactionReceipt;
  status: "pending" | "success" | "reverted" | "rejected" | "unknown";
  write?: Write;
  logs?: Log[];
  error?: BaseError;
} & ({ hash: Hex; writeId?: string } | { hash?: Hex; writeId: string } | { hash: Hex; writeId: string });

export function useTransactionWatcher() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const [transactions, setTransactions] = useState<WatchedTransaction[]>([]);
  const observerWrites = useStore(store, (state) => state.writes);

  const handleTransaction = useCallback(
    async (hash: Hex, timestamp: bigint) => {
      if (!abi) return;

      const transaction = await getTransaction(wagmiConfig, { hash });
      if (transaction.to !== worldAddress) return;

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

      setTransactions((prevTransactions) => [
        {
          hash,
          from: transaction.from,
          timestamp,
          transaction,
          status: "pending",
          functionData: {
            functionName,
            args,
          },
          value: transaction.value,
        },
        ...prevTransactions,
      ]);

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

      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.hash === hash
            ? {
                ...transaction,
                receipt,
                logs,
                status,
                error: transactionError as BaseError,
              }
            : transaction,
        ),
      );
    },
    [abi, wagmiConfig, worldAddress],
  );

  useEffect(() => {
    for (const write of Object.values(observerWrites)) {
      const hash = write.hash;
      if (write.type === "waitForTransactionReceipt" && hash) {
        const transaction = transactions.find((transaction) => transaction.hash === hash);
        if (!transaction) {
          handleTransaction(hash, BigInt(write.time) / 1000n);
        }
      }
    }
  }, [handleTransaction, observerWrites, transactions]);

  useWatchBlocks({
    onBlock(block) {
      for (const hash of block.transactions) {
        if (transactions.find((transaction) => transaction.hash === hash)) continue;
        handleTransaction(hash, block.timestamp);
      }
    },
    chainId,
    pollingInterval: 500,
  });

  const mergedTransactions = useMemo((): WatchedTransaction[] => {
    const mergedMap = new Map<string | undefined, WatchedTransaction>();

    for (const write of Object.values(observerWrites)) {
      const parsedAbiItem = parseAbiItem(`function ${write.functionSignature}`) as AbiFunction;
      const writeResult = write.events.find((event): event is Message<"write:result"> => event.type === "write:result");

      mergedMap.set(write.hash || write.writeId, {
        from: write.from,
        status: writeResult?.status === "rejected" ? "rejected" : "pending",
        timestamp: BigInt(write.time) / 1000n,
        functionData: {
          functionName: parsedAbiItem.name,
          args: write.args,
        },
        value: write.value,
        error: writeResult && "reason" in writeResult ? (writeResult.reason as BaseError) : undefined,
        write,
      });
    }

    for (const transaction of transactions) {
      const existing = mergedMap.get(transaction.hash);
      if (existing) {
        mergedMap.set(transaction.hash, { ...transaction, write: existing.write });
      } else {
        mergedMap.set(transaction.hash, { ...transaction });
      }
    }

    return Array.from(mergedMap.values()).sort((a, b) => Number(b.timestamp ?? 0n) - Number(a.timestamp ?? 0n));
  }, [transactions, observerWrites]);

  return mergedTransactions;
}
