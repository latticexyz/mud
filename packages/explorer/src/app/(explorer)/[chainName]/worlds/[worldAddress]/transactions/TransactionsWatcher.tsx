"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import { Abi, DecodeFunctionDataReturnType, Transaction, decodeFunctionData, parseEventLogs } from "viem";
import { useConfig, useWaitForTransactionReceipt, useWatchPendingTransactions } from "wagmi";
import React, { useMemo, useState } from "react";
import {
  ExpandedState,
  Row,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getTransaction } from "@wagmi/core";
import { Badge } from "../../../../../../components/ui/Badge";
import { Separator } from "../../../../../../components/ui/Separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";

type FinalTransaction = Transaction & DecodeFunctionDataReturnType<Abi>;

const columnHelper = createColumnHelper<FinalTransaction>();
const columns = [
  columnHelper.accessor("blockNumber", {
    header: "",
    cell: (row) => <Badge variant="outline">#{row.getValue()?.toString()}</Badge>,
  }),
  columnHelper.accessor("hash", {
    header: "tx hash:",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("functionName", {
    header: "function:",
    cell: ({ row }) => <Badge variant="secondary">{row.original.functionName}</Badge>,
  }),
  columnHelper.accessor("from", {
    header: "from:",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: "status:",
    cell: (row) => {
      const status = true;

      if (status) {
        return <Badge variant="success">success</Badge>;
      }

      return <Badge variant="destructive">failed</Badge>;
    },
  }),
  // TODO: add proper time
  columnHelper.accessor("timestamp", {
    header: "time",
    cell: (row) => "5s ago",
  }),
  columnHelper.accessor("expand", {
    header: "",
    cell: (row) => <ChevronsUpDownIcon className="h-4 w-4" />,
  }),
];

function TransactionTableRow({ row, abi }: { row: Row<FinalTransaction>; abi: Abi }) {
  const { data } = useWaitForTransactionReceipt({
    hash: row.original.hash,
  });

  const args = row.original.args;

  console.log("ARGS:", args);

  const eventLogs = useMemo(() => {
    if (!data) return [];

    console.log(
      "data",
      data,
      parseEventLogs({
        abi,
        logs: data.logs,
      }),
    );

    return parseEventLogs({
      abi,
      logs: data.logs,
    });
  }, [abi, data]);

  console.log("event logs:", eventLogs);

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => row.toggleExpanded()}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
        ))}
      </TableRow>

      {row.getIsExpanded() && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={columns.length}>
            {data && (
              <>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Block number:</h3>
                    <p className="text-sm">{data.blockNumber.toString()}</p>
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Tx hash:</h3>
                    <TruncatedHex hex={row.original.hash} />
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">From:</h3>
                    <TruncatedHex hex={row.original.from} />
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Tx value:</h3>
                    <p className="text-sm">TODO:</p>
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Gas used:</h3>
                    <p className="text-sm">{data.gasUsed.toString()}</p>
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Base fee (TODO):</h3>
                    <p className="text-sm">{data.gasUsed.toString()}</p>
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Priority fee (TODO):</h3>
                    <p className="text-sm">{data.gasUsed.toString()}</p>
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Gas price:</h3>
                    <p className="text-sm">{data.effectiveGasPrice.toString()}</p>
                  </div>

                  <div>
                    <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Total fee:</h3>
                    <p className="text-sm">TODO:</p>
                  </div>
                </div>

                <Separator className="mt-6" />

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Errors:</h3>
                  <p className="text-sm">{data.status === "success" ? "No errors" : "Transaction failed"}</p>
                </div>

                <Separator className="mt-6" />

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Logs:</h3>

                  <pre className="mt-2 border border-white/20 p-2">
                    {eventLogs.length > 0 && (
                      <ul className="break-words [&_ul]:list-[revert]">
                        {eventLogs.map((eventLog, idx) => (
                          <li key={idx}>
                            {eventLog.eventName}:
                            <ul className="list-inside pl-2 pt-1">
                              {Object.entries(eventLog.args).map(([key, value]) => (
                                <li key={key} className="mt-1">
                                  {key}: {value}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}
                  </pre>
                </div>

                <Separator className="mt-6" />

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Inputs:</h3>

                  <div className="mt-2 border border-white/20 p-2">
                    {args?.map((arg, idx) => (
                      <div key={idx}>
                        <span className="text-xs text-muted-foreground">arg {idx + 1}</span> {arg.toString()}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function TransactionsWatcher() {
  const { data } = useWorldAbiQuery();
  const [transactions, setTransactions] = useState<FinalTransaction[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const wagmiConfig = useConfig();
  const abi = data?.abi;

  useWatchPendingTransactions({
    onTransactions: async (txHashes) => {
      if (!abi) return;

      const incomingTransactions = await Promise.all(
        txHashes.map(async (hash) => {
          const tx = await getTransaction(wagmiConfig, { hash });
          const parsedTx = decodeFunctionData({
            abi,
            data: tx.input,
          });
          return { ...tx, ...parsedTx } as FinalTransaction;
        }),
      );

      setTransactions([...transactions, ...incomingTransactions]);
    },
  });

  console.log("transactions", transactions);

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      expanded,
    },
    // getSubRows: (row) => row.subRows, // TODO: type
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
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
