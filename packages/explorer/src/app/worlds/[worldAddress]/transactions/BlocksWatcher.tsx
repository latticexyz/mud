"use client";

import { useSearchParams } from "next/navigation";
import {
  Abi,
  DecodeFunctionDataReturnType,
  Hex,
  Log,
  ParseEventLogsReturnType,
  Transaction,
  TransactionReceipt,
  decodeFunctionData,
  parseEventLogs,
} from "viem";
import { useTransactionReceipt, useWaitForTransactionReceipt, useWatchPendingTransactions } from "wagmi";
import React, { useEffect, useState } from "react";
import {
  ExpandedState,
  Row,
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

BigInt.prototype.toJSON = function () {
  return this.toString();
};

type Props = {
  abi: Abi;
};

type FinalTransaction = Transaction & DecodeFunctionDataReturnType<Abi>;

const columnHelper = createColumnHelper<FinalTransaction>();

const columns = [
  // columnHelper.accessor("blockNumber", {
  //   header: "#",
  // }),
  columnHelper.accessor("functionName", {
    header: "function",
    cell: ({ row }) => {
      const functionName = row.original.functionName;
      const args = row.original?.args?.map((arg) => `"${arg}"`).join(", ");
      return (
        <div className="w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
          {functionName + "(" + args + ")"}
        </div>
      );
    },
  }),
  columnHelper.accessor("hash", {
    header: "tx hash",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),

  columnHelper.accessor("from", {
    header: "from",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  // columnHelper.accessor("to", {
  //   header: "to",
  //   cell: (row) => <TruncatedHex hex={row.getValue()} />,
  // }),
  // columnHelper.accessor("gas", {
  //   header: "gas",
  //   cell: (row) => row.getValue().toString(),
  // }),
];

function TransactionTableRow({ row, abi }: { row: Row<FinalTransaction>; abi: Abi }) {
  const { data, isLoading } = useWaitForTransactionReceipt({
    hash: row.original.hash,
  });
  const [eventLogs, setEventLogs] = useState<any[]>([]);

  console.log("row", row.original.hash, data, isLoading);

  useEffect(() => {
    if (data) {
      console.log("data", data);

      const eventLogs = parseEventLogs({
        abi,
        logs: data.logs,
      });

      setEventLogs(eventLogs);
    }
  }, [abi, data]);

  return (
    <>
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

      {row.getIsExpanded() && (
        <TableRow>
          <TableCell colSpan={columns.length}>
            {data && (
              <>
                <div>
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">From:</h3>
                  <TruncatedHex hex={row.original.from} />
                </div>

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Block number:</h3>
                  <p className="text-sm">{data.blockNumber.toString()}</p>
                </div>

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Gas used:</h3>
                  <p className="text-sm">{data.gasUsed.toString()}</p>
                </div>

                {eventLogs.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">Event logs:</h3>
                    <ul className="list-inside list-disc pt-3 [&_ul]:list-[revert]">
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
                  </div>
                )}

                {/* <pre className="mt-4 max-w-[500px] rounded-md border border-orange-500 p-2 text-xs">
                  {JSON.stringify(data, null, 2)}
                </pre> */}
              </>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function BlocksWatcher({ abi }: Props) {
  const searchParams = useSearchParams();
  const worldAddres = searchParams.get("worldAddress");
  const [transactions, setTransactions] = useState<FinalTransaction[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // console.log(worldAddres, abi);

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      expanded,
    },
    getSubRows: (row) => row.subRows,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const addTransactions = (txs: FinalTransaction[]) => {
    setTransactions([...transactions, ...txs]);
  };

  useWatchPendingTransactions({
    onTransactions: async (txHashes) => {
      const transactions = await Promise.all(
        txHashes.map(async (hash) => {
          const tx = await getTransaction(wagmiConfig, { hash });
          const parsedTx = decodeFunctionData({
            abi,
            data: tx.input,
          });
          // const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

          return { ...tx, ...parsedTx } as FinalTransaction;
        }),
      );

      addTransactions(transactions);
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
