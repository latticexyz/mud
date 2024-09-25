import { ArrowUpDownIcon, LoaderIcon } from "lucide-react";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { Schema, Table as TableType } from "@latticexyz/config";
import { getKeySchema, getKeyTuple, getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
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
import { TableData } from "../../../../queries/useTableDataQuery";
import { EditableTableCell } from "./EditableTableCell";

const initialSortingState: SortingState = [];
const initialRows: TableData["rows"] = [];

export function TablesViewer({
  tableConfig,
  tableData,
  isLoading,
}: {
  tableConfig?: TableType;
  tableData?: TableData;
  isLoading: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useQueryState("filter", parseAsString.withDefault(""));
  const [sorting, setSorting] = useQueryState("sort", parseAsJson<SortingState>().withDefault(initialSortingState));

  const tableColumns: ColumnDef<getSchemaPrimitives<Schema>>[] = useMemo(() => {
    if (!tableConfig || !tableData) return [];

    return tableData.columns.map((name) => {
      const type = tableConfig?.schema[name]?.type;
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
        cell: ({ row }) => {
          const namespace = tableConfig?.namespace;
          const keySchema = getKeySchema(tableConfig);
          const value = row.getValue(name)?.toString();

          if (!tableConfig || Object.keys(keySchema).includes(name) || internalNamespaces.includes(namespace)) {
            return value;
          }

          const keyTuple = getKeyTuple(tableConfig, row.original as never);
          return <EditableTableCell name={name} tableConfig={tableConfig} value={value} keyTuple={keyTuple} />;
        },
      };
    });
  }, [tableConfig, tableData]);

  const table = useReactTable({
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
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm rounded border px-2 py-1"
          disabled={!tableData}
        />
      </div>

      <div className="rounded-md border">
        {isLoading && (
          <div className="flex h-24 items-center justify-center">
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!isLoading && (
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
                  <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
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
      </div>
    </>
  );
}
