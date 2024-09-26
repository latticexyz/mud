"use client";

import {
  DecodeFunctionDataReturnType,
  Hex,
  Log,
  Transaction,
  TransactionReceipt,
  decodeFunctionData,
  parseEventLogs,
} from "viem";
import { useConfig, useWatchPendingTransactions } from "wagmi";
import React, { useState } from "react";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { getTransaction, getTransactionReceipt } from "@wagmi/core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { TransactionTableRow } from "./TransactionTableRow";
import { columns } from "./columns";

type BaseWatchedTransaction = {
  hash: Hex;
  transaction: Transaction;
  functionData: DecodeFunctionDataReturnType;
  timestamp: string;

  receipt?: TransactionReceipt; // TODO: update
  logs?: Log[]; // TODO: update
};

type PendingWatchedTransaction = BaseWatchedTransaction & {
  status: "pending";
};

type SuccessWatchedTransaction = BaseWatchedTransaction & {
  status: "success";
  receipt: TransactionReceipt;
  logs: Log[];
};

type FailedWatchedTransaction = BaseWatchedTransaction & {
  status: "failed";
  receipt: TransactionReceipt;
};

export type WatchedTransaction = PendingWatchedTransaction | SuccessWatchedTransaction | FailedWatchedTransaction;

export function TransactionsTable() {
  const { data } = useWorldAbiQuery();
  const [transactions, setTransactions] = useState<WatchedTransaction[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const wagmiConfig = useConfig();
  const abi = data?.abi;

  const handleTransaction = async (hash: Hex) => {
    // TODO: handle error
    // TODO: handle transactions not included in the block
    setTransactions((transactions) => [{ hash, status: "pending", timestamp: Date.now() }, ...transactions]);

    const transaction = await getTransaction(wagmiConfig, { hash });
    const functionData = decodeFunctionData({
      abi,
      data: transaction.input,
    });
    setTransactions((transactions) => {
      const index = transactions.findIndex((tx) => tx.hash === hash);
      if (index === -1) return transactions;
      return [
        ...transactions.slice(0, index),
        {
          ...transactions[index],
          transaction,
          functionData,
        },
        ...transactions.slice(index + 1),
      ];
    });

    const receipt = await getTransactionReceipt(wagmiConfig, { hash });
    const logs = parseEventLogs({
      abi,
      logs: receipt.logs,
    });
    setTransactions((transactions) => {
      const index = transactions.findIndex((tx) => tx.hash === hash);
      if (index === -1) return transactions;
      return [
        ...transactions.slice(0, index),
        {
          ...transactions[index],
          receipt,
          logs,
          status: "success",
        },
        ...transactions.slice(index + 1),
      ];
    });
  };

  useWatchPendingTransactions({
    onTransactions: (hashes) => {
      for (const hash of hashes) {
        handleTransaction(hash);
      }
    },
  });

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className="text-xs uppercase">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => <TransactionTableRow key={row.id} row={row} abi={abi} />)
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No transactions.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
