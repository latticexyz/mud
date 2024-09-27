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
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { getTransaction, getTransactionReceipt } from "@wagmi/core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { TransactionTableRow } from "./TransactionTableRow";
import { columns } from "./columns";

type WatchedTransaction = {
  hash: Hex;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  receipt?: TransactionReceipt;
  logs?: Log[];
  status: "pending" | "success" | "failed";
};

export function TransactionsTable() {
  const { id: chainId } = useChain();
  const { data } = useWorldAbiQuery();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const wagmiConfig = useConfig();
  const abi = data?.abi;

  const { data: hashes } = useQuery<Hex[]>({
    queryKey: ["hashes"],
    enabled: false,
    initialData: [],
  });
  const transactions = useQueries<WatchedTransaction[]>({
    queries: hashes?.map((hash) => ({
      queryKey: ["transactions", hash],
      queryFn: async ({ queryKey }) => {
        queryClient.setQueryData(queryKey, { hash, status: "pending", timestamp: Date.now() });

        const transaction = await getTransaction(wagmiConfig, { hash });
        const functionData = decodeFunctionData({
          abi,
          data: transaction.input,
        });
        queryClient.setQueryData(queryKey, (prev) => {
          return {
            ...prev,
            transaction,
            functionData,
          };
        });

        const receipt = await getTransactionReceipt(wagmiConfig, { hash });
        const logs = parseEventLogs({
          abi,
          logs: receipt.logs,
        });
        queryClient.setQueryData(queryKey, (prev) => {
          return {
            ...prev,
            receipt,
            logs,
            status: "success",
          };
        });
      },
      retry: 5,
    })),
    combine: (results) => results.map((result) => result.data),
  });

  useWatchPendingTransactions({
    onTransactions: (hashes) => {
      queryClient.setQueryData(["hashes"], (currentHashes: Hex[]) => [...hashes, ...currentHashes]);
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
