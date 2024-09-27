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
import { createColumnHelper } from "@tanstack/react-table";
import { getTransaction, getTransactionReceipt } from "@wagmi/core";
import { Badge } from "../../../../../../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { TimeAgoCell } from "./TimeAgoCell";
import { TransactionTableRow } from "./TransactionTableRow";

export type WatchedTransaction = {
  hash: Hex;
  timestamp: bigint;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  receipt?: TransactionReceipt;
  logs?: Log[];
  status: "pending" | "success" | "failed";
};

const columnHelper = createColumnHelper<WatchedTransaction>();
export const columns = [
  columnHelper.accessor("transaction.blockNumber", {
    header: "",
    cell: (row) => <Badge variant="outline">#{row.getValue()?.toString()}</Badge>,
  }),
  columnHelper.accessor("hash", {
    header: "tx hash:",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("functionData.functionName", {
    header: "function:",
    cell: (row) => <Badge variant="secondary">{row.getValue()}</Badge>,
  }),
  columnHelper.accessor("transaction.from", {
    header: "from:",
    cell: (row) => {
      const from = row.getValue();
      if (!from) return null;
      return <TruncatedHex hex={from} />;
    },
  }),
  columnHelper.accessor("status", {
    header: "status:",
    cell: (row) => {
      const status = row.getValue();
      if (status === "success") {
        return <Badge variant="success">success</Badge>;
      } else if (status === "failed") {
        return <Badge variant="destructive">failed</Badge>;
      }
      return <Badge variant="outline">pending</Badge>;
    },
  }),
  columnHelper.accessor("timestamp", {
    header: "time:",
    cell: (row) => {
      const timestamp = row.getValue();
      return <TimeAgoCell timestamp={timestamp} />;
    },
  }),
];

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
          table.getRowModel().rows.map((row) => <TransactionTableRow key={row.id} row={row} />)
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
