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
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { getTransaction, getTransactionReceipt } from "@wagmi/core";
import { Badge } from "../../../../../../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { Write, store } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { TimeAgoCell } from "./TimeAgoCell";
import { TransactionTableRow } from "./TransactionTableRow";

export type WatchedTransaction = {
  hash?: Hex;
  timestamp?: bigint;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  receipt?: TransactionReceipt;
  logs?: Log[];
  status: "pending" | "success" | "failed";
  write?: Write;
};

const columnHelper = createColumnHelper<WatchedTransaction>();
export const columns = [
  columnHelper.accessor("transaction.blockNumber", {
    header: "",
    cell: (row) => <Badge variant="outline">#{row.getValue()?.toString()}</Badge>,
  }),
  columnHelper.accessor("hash", {
    header: "tx hash:",
    cell: (row) => {
      const hash = row.getValue();
      if (!hash) return null;
      return <TruncatedHex hex={hash} />;
    },
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

  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;

  const observerWrites = useStore(store, (state) => Object.values(state.writes));
  const transactions = useStore(store, (state) => state.transactions);

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

      store.setState((state) => {
        return {
          transactions: [
            ...state.transactions,
            {
              hash,
              transaction,
              functionData,
              receipt,
              logs,
              timestamp,
              status: receipt.status === "success" ? "success" : "failed",
            },
          ],
        };
      });
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

  return <TransactionTableView data={mergedTransactions} />;
}

function TransactionTableView({ data }: { data: WatchedTransaction[] }) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const table = useReactTable({
    data,
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
