"use client";

import { useParams } from "next/navigation";
import {
  DecodeFunctionDataReturnType,
  Hex,
  Log,
  Transaction,
  TransactionReceipt,
  decodeFunctionData,
  parseEventLogs,
} from "viem";
import { useConfig, useWatchBlocks } from "wagmi";
import { useStore } from "zustand";
import React, { useMemo, useState } from "react";
import { getTransaction, getTransactionReceipt } from "@wagmi/core";
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
  logs?: Log[];
  status: "pending" | "success" | "reverted";
  write?: Write;
};

export function TransactionsTableContainer() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams();
  const wagmiConfig = useConfig();

  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;

  const [transactions, setTransactions] = useState<WatchedTransaction[]>([]);
  const observerWrites = useStore(store, (state) => Object.values(state.writes));

  console.log("123 observerWrites:", observerWrites);
  console.log("123 transactions:", transactions);

  const mergedTransactions = useMemo((): WatchedTransaction[] => {
    const mergedMap = new Map<Hex | undefined, WatchedTransaction>();

    for (const transaction of transactions) {
      mergedMap.set(transaction.hash, { ...transaction });
    }

    for (const write of observerWrites) {
      const existing = mergedMap.get(write.hash);
      if (existing) {
        mergedMap.set(write.hash, { ...existing, write });
      } else {
        mergedMap.set(write.hash, { write, status: "pending" });
      }
    }

    return Array.from(mergedMap.values());
  }, [transactions, observerWrites]);

  console.log("mergedTransactions:", mergedTransactions);

  async function handleTransaction(hash: Hex, timestamp: bigint) {
    if (!abi) return;

    const transaction = await getTransaction(wagmiConfig, { hash });
    if (transaction.to === worldAddress) {
      const functionData = decodeFunctionData({
        abi,
        data: transaction.input,
      });

      const receipt = await getTransactionReceipt(wagmiConfig, { hash });
      const logs = parseEventLogs({
        abi,
        logs: receipt.logs,
      });

      setTransactions((transactions) => [
        {
          hash,
          transaction,
          functionData,
          receipt,
          logs,
          timestamp,
          status: receipt.status,
        },
        ...transactions,
      ]);
    }
  }

  useWatchBlocks({
    onBlock(block) {
      for (const hash of block.transactions) {
        if (transactions.find((transaction) => transaction.hash === hash)) continue;
        handleTransaction(hash, block.timestamp);
      }
    },
    chainId,
    pollingInterval: 1000,
  });

  return <TransactionsTableView data={mergedTransactions} />;
}
