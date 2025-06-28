"use client";

import { BoxIcon, CheckCheckIcon, ReceiptTextIcon, UserPenIcon, XIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../../../../../components/ui/Badge";
import { Input } from "../../../../../../components/ui/Input";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { cn } from "../../../../../../utils";
import { useChain } from "../../../../hooks/useChain";
import { useIndexerForChainId } from "../../../../hooks/useIndexerForChainId";
import { useTransactionsQuery } from "../../../../queries/useTransactionsQuery";
import { BlockExplorerLink } from "./BlockExplorerLink";
import { TimeAgo } from "./TimeAgo";
import { TimingRowHeader } from "./TimingRowHeader";
import { TransactionTableRow } from "./TransactionTableRow";
import { ObservedTransaction, useMergedTransactions } from "./useMergedTransactions";

const columnHelper = createColumnHelper<ObservedTransaction>();
export const columns = [
  columnHelper.accessor("blockNumber", {
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
  columnHelper.accessor("calls", {
    header: "Function(s)",
    cell: (row) => {
      const calls = row.getValue();
      const status = row.row.original.status;
      return (
        <div className="flex items-center">
          <div className="flex gap-2">
            {calls.map(({ functionName }, idx) => (
              <Badge variant="secondary" key={idx}>
                {functionName}
              </Badge>
            ))}
          </div>

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
  const { ref, inView } = useInView();
  const { id: chainId } = useChain();
  const indexer = useIndexerForChainId(chainId);
  const transactions = useMergedTransactions();
  const { data: indexedTransactions, fetchNextPage } = useTransactionsQuery();
  const loadedInitialTransactions = Array.isArray(indexedTransactions) && indexedTransactions.length > 0;
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [filters, setFilters] = useState({
    blockNumber: "",
    from: "",
    calls: "",
    hash: "",
    timestamp: "",
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  // Filter transactions based on filter values
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filters.blockNumber && !transaction.blockNumber?.toString().includes(filters.blockNumber)) {
        return false;
      }
      if (filters.from && !transaction.from?.toLowerCase().includes(filters.from.toLowerCase())) {
        return false;
      }
      if (
        filters.calls &&
        !transaction.calls?.some((call) => call.functionName?.toLowerCase().includes(filters.calls.toLowerCase()))
      ) {
        return false;
      }
      if (filters.hash && !transaction.hash?.toLowerCase().includes(filters.hash.toLowerCase())) {
        return false;
      }
      if (filters.timestamp && !transaction.timestamp?.toString().includes(filters.timestamp)) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const table = useReactTable({
    data: filteredTransactions,
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
    <div className="space-y-4">
      {/* Filter Row */}
      <div className="grid grid-cols-5 gap-4 rounded-md border bg-muted/20 p-4">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">Block</label>
          <Input
            placeholder="Filter block..."
            value={filters.blockNumber}
            onChange={(e) => setFilters((prev) => ({ ...prev, blockNumber: e.target.value }))}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">From</label>
          <Input
            placeholder="Filter address..."
            value={filters.from}
            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">Functions</label>
          <Input
            placeholder="Filter functions..."
            value={filters.calls}
            onChange={(e) => setFilters((prev) => ({ ...prev, calls: e.target.value }))}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">Tx Hash</label>
          <Input
            placeholder="Filter hash..."
            value={filters.hash}
            onChange={(e) => setFilters((prev) => ({ ...prev, hash: e.target.value }))}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">Time</label>
          <Input
            placeholder="Filter time..."
            value={filters.timestamp}
            onChange={(e) => setFilters((prev) => ({ ...prev, timestamp: e.target.value }))}
            className="h-8 text-xs"
          />
        </div>
      </div>

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

        {indexer.type === "hosted" && (
          <TableFooter
            className={cn("border-t-transparent bg-transparent hover:bg-transparent", {
              "border-t-muted": loadedInitialTransactions,
            })}
          >
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div
                  ref={ref}
                  className={cn(
                    "hidden items-center justify-center gap-3 py-4 font-mono text-xs font-bold uppercase text-muted-foreground",
                    {
                      flex: loadedInitialTransactions,
                    },
                  )}
                >
                  <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-muted-foreground" />
                  Loading more transactions...
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
