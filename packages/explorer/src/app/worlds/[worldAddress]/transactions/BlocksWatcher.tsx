"use client";

import { useSearchParams } from "next/navigation";
import { Abi, TransactionReceipt, decodeFunctionData } from "viem";
import { useWatchPendingTransactions } from "wagmi";
import React, { useState } from "react";
import {
  ExpandedState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/Table";
import { TruncatedHex } from "../../../../components/ui/TruncatedHex";
import { wagmiConfig } from "../../../Providers";

type Props = {
  abi: Abi;
};

const columnHelper = createColumnHelper<TransactionReceipt>();

const columns = [
  columnHelper.accessor("blockNumber", {
    header: "#",
    cell: (row) => row.getValue().toString(),
  }),
  columnHelper.accessor("transactionHash", {
    header: "tx hash",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("from", {
    header: "from",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("to", {
    header: "to",
    cell: (row) => {
      const value = row.getValue();
      if (!value) {
        return null;
      }

      return <TruncatedHex hex={value} />;
    },
  }),
  columnHelper.accessor("gasUsed", {
    header: "gas used",
    cell: (row) => row.getValue().toString(),
  }),
];

export function BlocksWatcher({ abi }: Props) {
  const searchParams = useSearchParams();
  const worldAddres = searchParams.get("worldAddress");
  const [transactions, setTransactions] = useState<TransactionReceipt[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  console.log(worldAddres, abi);

  const table = useReactTable({
    data: transactions,
    columns,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const addTransactions = (txs: TransactionReceipt[]) => {
    setTransactions([...transactions, ...txs]);
  };

  const waitForReceipts = async (txHashes: string[]) => {
    try {
      const receipts = await Promise.all(
        txHashes.map((txHash) => waitForTransactionReceipt(wagmiConfig, { hash: txHash })),
      );

      console.log(receipts);

      addTransactions(receipts);
    } catch (error) {
      console.error("Error getting transaction:", error);
    }
  };

  useWatchPendingTransactions({
    onTransactions: async (txHashes) => {
      console.log("new transactions:", txHashes);

      const tx = await getTransaction(wagmiConfig, { hash: txHashes[0] });
      console.log("transaction:", tx);

      const parsedTx = decodeFunctionData({
        abi,
        data: tx.input,
      });
      console.log("parsedTx:", parsedTx);

      await waitForReceipts(txHashes);
    },
  });

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
            <React.Fragment key={row.id}>
              <TableRow
                onClick={() => {
                  row.toggleExpanded();
                }}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>

              {/* TODO: {row.getIsExpanded() && ( */}
              {expanded[row.id] && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <h3>Additional Information</h3>
                    <p>
                      This is some random expanded content for the transaction. You can replace this with actual
                      transaction details or any other relevant information.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
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
