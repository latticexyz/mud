import { CheckCheckIcon, ExternalLinkIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../../../../../components/ui/Badge";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { BlockExplorerLink } from "./BlockExplorerLink";
import { TimeAgoCell } from "./TimeAgoCell";
import { TransactionTableRow } from "./TransactionTableRow";
import { WatchedTransaction } from "./TransactionsTableContainer";

const columnHelper = createColumnHelper<WatchedTransaction>();
export const columns = [
  columnHelper.accessor("transaction.blockNumber", {
    header: "",
    cell: (row) => {
      const blockNumber = row.getValue();
      if (!blockNumber) return <Skeleton className="h-4 w-full" />;
      return <Badge variant="outline">#{blockNumber.toString()}</Badge>;
    },
  }),
  columnHelper.accessor("transaction.from", {
    header: "from",
    cell: (row) => {
      const from = row.getValue();
      if (!from) return <Skeleton className="h-4 w-full" />;
      return <TruncatedHex hex={from} />;
    },
  }),
  columnHelper.accessor("functionData.functionName", {
    header: "function",
    cell: (row) => {
      const functionName = row.getValue();
      const status = row.row.original.status;
      return (
        <div className="flex items-center">
          <Badge variant="secondary">{functionName}</Badge>

          {status === "pending" && <CheckCheckIcon className="ml-2 h-4 w-4 text-muted" />}
          {status === "success" && <CheckCheckIcon className="ml-2 h-4 w-4 text-green-400" />}
          {status === "reverted" && <XIcon className="ml-2 h-4 w-4 text-red-400" />}
        </div>
      );
    },
  }),
  columnHelper.accessor("hash", {
    header: "tx hash",
    cell: (row) => {
      const hash = row.getValue();
      if (!hash) return <Skeleton className="h-4 w-full" />;
      return (
        <BlockExplorerLink hash={hash}>
          <div className="flex items-center">
            <ExternalLinkIcon className="mr-2 h-3 w-3" /> <TruncatedHex hex={hash} />
          </div>
        </BlockExplorerLink>
      );
    },
  }),
  columnHelper.accessor("timestamp", {
    header: "time",
    cell: (row) => {
      const timestamp = row.getValue();
      if (!timestamp) return <Skeleton className="h-4 w-full" />;
      return <TimeAgoCell timestamp={timestamp} />;
    },
  }),
];

export function TransactionsTableView({ data }: { data: WatchedTransaction[] }) {
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
