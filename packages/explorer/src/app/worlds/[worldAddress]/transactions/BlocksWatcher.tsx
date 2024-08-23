"use client";

import { useSearchParams } from "next/navigation";
import { Abi, TransactionReceipt } from "viem";
import { useWatchPendingTransactions } from "wagmi";
import React, { useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/Table";
import { TruncatedHex } from "../../../../components/ui/TruncatedHex";
import { wagmiConfig } from "../../../Providers";

type Props = {
  abi: Abi;
};

const columnHelper = createColumnHelper<TransactionReceipt>();

const columns = [
  columnHelper.accessor("transactionHash", {
    header: "Hash",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("to", {
    header: "To",
    cell: (row) => {
      const value = row.getValue();
      if (!value) {
        return null;
      }

      return <TruncatedHex hex={value} />;
    },
  }),
  columnHelper.accessor("gasUsed", {
    header: "Gas used",
    cell: (row) => row.getValue().toString(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (row) => row.getValue(),
  }),
];

export function BlocksWatcher({ abi }: Props) {
  const searchParams = useSearchParams();
  const worldAddres = searchParams.get("worldAddress");
  const [transactions, setTransactions] = useState<TransactionReceipt[]>([]);

  console.log(worldAddres, abi);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const addTransaction = (tx: TransactionReceipt) => {
    setTransactions([...transactions, tx]);
  };

  useWatchPendingTransactions({
    onTransactions: async (txHashes) => {
      console.log("new transactions:", txHashes);

      for (const txHash of txHashes) {
        try {
          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash,
          });

          addTransaction(receipt);
        } catch (error) {
          console.error("Error getting transaction:", error);
        }
      }
    },
  });

  console.log(transactions);

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
