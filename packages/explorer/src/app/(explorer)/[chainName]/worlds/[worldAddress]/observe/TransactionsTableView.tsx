import React, { useState } from "react";
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../../../../../components/ui/Badge";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
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
  columnHelper.accessor("hash", {
    header: "tx hash:",
    cell: (row) => {
      const hash = row.getValue();
      if (!hash) return <Skeleton className="h-4 w-full" />;
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
      if (!from) return <Skeleton className="h-4 w-full" />;
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
