"use client";

import { BoxIcon, CheckCheckIcon, ReceiptTextIcon, UserPenIcon, WalletIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../../../../../components/ui/Badge";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { BlockExplorerLink } from "./BlockExplorerLink";
import { TimeAgo } from "./TimeAgo";
import { TimingRowHeader } from "./TimingRowHeader";
import { TransactionTableRow } from "./TransactionTableRow";
import { ObservedTransaction, useObservedTransactions } from "./useObservedTransactions";

const columnHelper = createColumnHelper<ObservedTransaction>();
export const columns = [
  columnHelper.accessor("receipt.blockNumber", {
    header: "Block",
    cell: (row) => {
      const status = row.row.original.status;
      if (status === "rejected") return <span className="text-white/60">N/A</span>;

      const blockNumber = row.getValue();
      if (!blockNumber) return <Skeleton className="h-4 w-full" />;
      return (
        <div className="flex items-center gap-1">
          <BoxIcon className="mr-1 h-3 w-3" />
          {blockNumber.toString()}
        </div>
      );
    },
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: (row) => {
      const from = row.getValue();
      if (!from) return <Skeleton className="h-4 w-full" />;
      return (
        <div className="flex items-center gap-1">
          <UserPenIcon className="mr-1 h-3 w-3" />
          <TruncatedHex hex={from} />
        </div>
      );
    },
  }),
  columnHelper.accessor("functionData.functionName", {
    header: "Function",
    cell: (row) => {
      const functionName = row.getValue();
      const status = row.row.original.status;
      return (
        <div className="flex items-center">
          <Badge variant="secondary">
            <WalletIcon className="mr-2 h-3 w-3" /> {functionName}
          </Badge>
          {status === "pending" && <CheckCheckIcon className="ml-2 h-4 w-4 text-white/60" />}
          {status === "success" && <CheckCheckIcon className="ml-2 h-4 w-4 text-green-400" />}
          {(status === "reverted" || status === "rejected") && <XIcon className="ml-2 h-4 w-4 text-red-400" />}
        </div>
      );
    },
  }),
  columnHelper.accessor("hash", {
    header: "Tx hash",
    cell: (row) => {
      const status = row.row.original.status;
      if (status === "rejected") return <span className="text-white/60">N/A</span>;

      const hash = row.getValue();
      if (!hash) return <Skeleton className="h-4 w-full" />;
      return (
        <div className="flex items-center gap-1">
          <ReceiptTextIcon className="mr-1 h-3 w-3" />
          <BlockExplorerLink hash={hash}>
            <TruncatedHex hex={hash} />
          </BlockExplorerLink>
        </div>
      );
    },
  }),
  columnHelper.accessor("timestamp", {
    header: "Time",
    cell: (row) => {
      const timestamp = row.getValue();
      const write = row.row.original.write;
      return (
        <>
          {timestamp ? <TimeAgo timestamp={timestamp} /> : <Skeleton className="h-4 w-14" />}
          {write && <TimingRowHeader {...write} />}
        </>
      );
    },
  }),
];

export function TransactionsTable() {
  const transactions = useObservedTransactions();
  const [expanded, setExpanded] = useState<ExpandedState>({});

  console.log("transactions", transactions);

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      expanded,
    },
    getRowId: (row) => row.writeId,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-[var(--color-background)]">
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
            <TableCell colSpan={columns.length}>
              <p className="flex items-center justify-center gap-3 py-4 font-mono text-xs font-bold uppercase text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-muted-foreground" /> Waiting for
                transactions…
              </p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
