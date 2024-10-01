"use client";

import { useParams } from "next/navigation";
import {
  AbiFunction,
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
import React, { useMemo, useState } from "react";
import { getTransaction, getTransactionReceipt, simulateContract } from "@wagmi/core";
import { Write, store } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { TransactionsTableView } from "./TransactionsTableView";

export type WatchedTransaction = {
  hash?: Hex;
  timestamp?: bigint;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  receipt?: TransactionReceipt;
  status: "pending" | "success" | "reverted";
  write?: Write;
  logs?: Log[];
  error?: BaseError;
};

export function TransactionsTableContainer() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const [transactions, setTransactions] = useState<WatchedTransaction[]>([]);
  const observerWrites = useStore(store, (state) => Object.values(state.writes));

  const mergedTransactions = useMemo((): WatchedTransaction[] => {
    const mergedMap = new Map<Hex | undefined, WatchedTransaction>();

    for (const write of observerWrites) {
      const parsedAbiItem = parseAbiItem(`function ${write.functionSignature}`) as AbiFunction;
      const functionData = {
        functionName: parsedAbiItem.name,
        args: write.args,
      };

      mergedMap.set(write.hash, {
        status: "pending",
        functionData,
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

    return Array.from(mergedMap.values()).reverse();
  }, [transactions, observerWrites]);

  async function handleTransaction(hash: Hex, timestamp: bigint) {
    if (!abi) return;

    const transaction = await getTransaction(wagmiConfig, { hash });
    if (transaction.to !== worldAddress) return;

    const receipt = await getTransactionReceipt(wagmiConfig, { hash });

    let functionName: string | undefined;
    let functionArgs: readonly unknown[] | undefined;
    let transactionError: BaseError | undefined;
    try {
      const functionData = decodeFunctionData({ abi, data: transaction.input });
      functionName = functionData.functionName;
      functionArgs = functionData.args;
    } catch (error) {
      transactionError = error as BaseError;
      functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
    }

    if (receipt.status === "reverted" && functionName) {
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
          args: functionArgs,
        });
      } catch (error) {
        transactionError = error as BaseError;
      }
    }

    const logs = parseEventLogs({
      abi,
      logs: receipt.logs,
    });

    setTransactions((prevTransactions) => [
      {
        hash,
        transaction,
        functionData: {
          functionName: functionName,
          args: functionArgs || [],
        },
        receipt,
        logs,
        timestamp,
        status: receipt.status,
        error: transactionError,
      },
      ...prevTransactions,
    ]);
  }

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

  return <TransactionsTableView data={mergedTransactions} />;
}
