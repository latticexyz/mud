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
import React, { useState } from "react";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { getTransaction, getTransactionReceipt } from "@wagmi/core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { TransactionTableRow } from "./TransactionTableRow";
import { columns } from "./columns";

export type WatchedTransaction = {
  hash: Hex;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  receipt?: TransactionReceipt;
  logs?: Log[];
  status: "pending" | "success" | "failed";
};

export function TransactionsTable() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams();
  const wagmiConfig = useConfig();
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [transactions, setTransactions] = useState<WatchedTransaction[]>([]);
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;

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
        ...transactions,
        {
          hash,
          transaction,
          functionData,
          receipt,
          logs,
          timestamp,
          status: receipt.status === "success" ? "success" : "failed",
        },
      ]);
    }
  }

  useWatchBlocks({
    onBlock(block) {
      for (const hash of block.transactions) {
        handleTransaction(hash, block.timestamp);
      }
    },
    chainId,
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
