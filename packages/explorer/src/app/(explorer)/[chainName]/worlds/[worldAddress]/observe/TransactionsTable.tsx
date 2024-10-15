"use client";

import { BoxIcon, CheckCheckIcon, ReceiptTextIcon, UserPenIcon, XIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { useState } from "react";
import {
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../../../../../components/ui/Badge";
import { Button } from "../../../../../../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/Select";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { BlockExplorerLink } from "./BlockExplorerLink";
import { TimeAgo } from "./TimeAgo";
import { TimingRowHeader } from "./TimingRowHeader";
import { TransactionTableRow } from "./TransactionTableRow";
import { WatchedTransaction, useTransactionWatcher } from "./useTransactionWatcher";

const columnHelper = createColumnHelper<WatchedTransaction>();
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
          <Badge variant="secondary">{functionName}</Badge>
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
  const transactions = useTransactionWatcher();
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pageIndex, setPageIndex] = useQueryState("txPage", parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState("txPageSize", parseAsInteger.withDefault(10));

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      expanded,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    getRowId: (row) => row.writeId,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      // TODO: check this more
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
  });

  return (
    <>
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
                  <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-muted-foreground" /> Waiting
                  for transactions…
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50, 100, 200].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
