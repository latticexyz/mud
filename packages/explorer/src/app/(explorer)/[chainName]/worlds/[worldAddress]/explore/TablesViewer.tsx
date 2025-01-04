import { ArrowUpDownIcon, LoaderIcon, LockIcon, TriangleAlertIcon } from "lucide-react";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { Hex, encodeAbiParameters, keccak256, pad } from "viem";
import { useMemo } from "react";
import { Table as TableType } from "@latticexyz/config";
import { getKeySchema, getKeyTuple } from "@latticexyz/protocol-parser/internal";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { internalNamespaces } from "../../../../../../common";
import { Button } from "../../../../../../components/ui/Button";
import { Input } from "../../../../../../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { cn } from "../../../../../../utils";
import { useCrosschainRecordsQuery } from "../../../../queries/useCrosschainRecordsQuery";
import { TData, TDataRow, useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { EditableTableCell } from "./EditableTableCell";
import { ExportButton } from "./ExportButton";
import { typeSortingFn } from "./utils/typeSortingFn";

const initialSortingState: SortingState = [];
const initialRows: TData["rows"] = [];

export function TablesViewer({ table, query }: { table?: TableType; query?: string }) {
  const { data: tableData, isLoading: isTDataLoading, isFetched, isError, error } = useTableDataQuery({ table, query });
  const { data: crosschainRecords } = useCrosschainRecordsQuery(table);
  const isLoading = isTDataLoading || !isFetched;
  const [globalFilter, setGlobalFilter] = useQueryState("filter", parseAsString.withDefault(""));
  const [sorting, setSorting] = useQueryState("sort", parseAsJson<SortingState>().withDefault(initialSortingState));

  const tableColumns: ColumnDef<TDataRow>[] = useMemo(() => {
    if (!table || !tableData) return [];

    return tableData.columns.map((name) => {
      const schema = table?.schema[name];
      const type = schema?.type;

      return {
        accessorKey: name,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="-ml-4"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span className="text-orange-500">{name}</span>
              <span className="ml-1 opacity-70">({type})</span>
              <ArrowUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        sortingFn: (rowA, rowB, columnId) => typeSortingFn(rowA, rowB, columnId, type),
        cell: ({ row }) => {
          const namespace = table?.namespace;
          const keySchema = getKeySchema(table);
          const value = row.getValue(name);
          if (!table || Object.keys(keySchema).includes(name) || internalNamespaces.includes(namespace)) {
            return value;
          }

          try {
            const keyTuple = getKeyTuple(table, row.original as never);
            return <EditableTableCell name={name} table={table} value={value} keyTuple={keyTuple} />;
          } catch (e) {
            console.error(e);
            return value;
          }
        },
      };
    });
  }, [table, tableData]);

  const reactTable = useReactTable({
    data: tableData?.rows ?? initialRows,
    columns: tableColumns,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <>
      <div className="flex items-center justify-between gap-4 pb-4">
        <Input
          placeholder="Filter..."
          value={globalFilter}
          onChange={(event) => reactTable.setGlobalFilter(event.target.value)}
          className="max-w-sm rounded border px-2 py-1"
          disabled={!tableData}
        />

        <ExportButton tableData={tableData} isLoading={isLoading} />
      </div>

      <div
        className={cn("rounded-md border", {
          "border-red-400": isError,
        })}
      >
        {isLoading && (
          <div className="flex h-24 items-center justify-center">
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!isLoading && (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                {!isError &&
                  reactTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableHeader>
              <TableBody>
                {!isError && reactTable.getRowModel().rows?.length ? (
                  reactTable.getRowModel().rows.map((row) => {
                    if (!table) return null;

                    try {
                      if (crosschainRecords?.rows) {
                        const keySchema = getKeySchema(table);
                        const keys = Object.keys(keySchema);
                        const keySchemaValues = keys.map((key) => pad(row.original[key!] as Hex));
                        const keyHash = keccak256(encodeAbiParameters([{ type: "bytes32[]" }], [keySchemaValues]));
                        const crosschainRecord = crosschainRecords.rows.find((record) => record.keyHash === keyHash);

                        if (crosschainRecord && !crosschainRecord.owned) {
                          return (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="relative">
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                              <td className="pointer-events-none absolute inset-0 bg-black/30 backdrop-blur-sm">
                                <div className="ml-[160px] flex h-full items-center font-mono text-xs uppercase">
                                  Bridged <LockIcon className="ml-2 h-3 w-3" />
                                </div>
                              </td>
                            </TableRow>
                          );
                        }
                      }
                    } catch (error) {
                      return (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className={cn("h-24 text-center", {
                        "text-red-400": isError,
                      })}
                    >
                      {isError ? (
                        <div className="flex items-center justify-center gap-x-2">
                          <TriangleAlertIcon /> Query error: {error.message}
                        </div>
                      ) : (
                        "No results."
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {tableData && `Total rows: ${tableData.rows.length.toLocaleString()}`}
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reactTable.previousPage()}
            disabled={!reactTable.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reactTable.nextPage()}
            disabled={!reactTable.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
